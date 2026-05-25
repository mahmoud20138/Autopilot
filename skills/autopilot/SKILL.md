---
name: autopilot
description: Autonomous orchestrator that takes a goal, discovers available tools, decomposes into phases, maps phases to skills, executes, and monitors until the project is done. Use when user wants full autonomous execution of a complex goal.
argument-hint: "The goal to accomplish autonomously"
---

# Autopilot Agent Mode

Fully autonomous orchestrator. Takes a user's goal, runs it to completion without human intervention.

**Announce at start:** "I'm using the Autopilot skill to autonomously accomplish: {user_goal}"

**Core principle:** Never implement anything directly. Orchestrate existing skills. Each phase delegates to a real skill.

**Portability:** Works on any PC. Dynamically discovers whatever skills, plugins, MCP servers, and CLI tools are installed. No hardcoded skill names.

## Pipeline

```
Input → Discovery → Analysis → Phase Detection → Skill Mapping → Prompt Generation → Execution → Monitor → Done
```

## Stop Conditions

**Stop only when:**
- All phases completed successfully
- Final verification passes (build succeeds, tests pass, no blockers)
- Project goal achieved

**Never stop for:**
- "Should I continue?" prompts
- Progress summaries
- Confirmation between phases

**Pause only if:**
- Hard blocker that no skill can resolve (missing external dependency, ambiguous requirement)
- Report the blocker and wait for user input

## Discovery (Runs First, Every Time)

Before doing anything, build an inventory of what's available on this system.

### Step 1: Scan Skills Directory

```bash
# Find skills directory
SKILLS_DIR="${HOME}/.openclaude/skills"
if [ -d "$SKILLS_DIR" ]; then
  for skill_dir in "$SKILLS_DIR"/*/; do
    if [ -f "${skill_dir}SKILL.md" ]; then
      # Read name and description from frontmatter
      head -5 "${skill_dir}SKILL.md"
    fi
  done
fi
```

For each skill found, extract:
- Name (from `name:` field in frontmatter)
- Description (from `description:` field in frontmatter)

Build a catalog: `[{"name": "skill-name", "description": "what it does"}, ...]`

### Step 2: Scan MCP Servers

Check what MCP tools are available by looking at tool names in the system context. Common patterns:
- `codegraph_*` — CodeGraph server available
- `mcp__plugin_playwright_*` — Playwright available
- `mcp__plugin_context7_*` — Context7 available

### Step 3: Scan CLI Tools

Check PATH for common tools:
```bash
for cmd in git node npm python pip pytest cargo go java mvn gradle docker; do
  command -v $cmd && echo "$cmd: available"
done
```

### Step 4: Scan Project Context

Check for project indicators:
```bash
# Language/Framework detection
[ -f "package.json" ] && echo "Node.js project" && cat package.json | head -20
[ -f "requirements.txt" ] && echo "Python project"
[ -f "Cargo.toml" ] && echo "Rust project"
[ -f "go.mod" ] && echo "Go project"
[ -f "pom.xml" ] && echo "Java/Maven project"
[ -f "build.gradle" ] && echo "Java/Gradle project"

# Test setup
[ -f "jest.config.js" ] && echo "Jest testing"
[ -f "pytest.ini" ] || [ -f "setup.cfg" ] && echo "Pytest setup"
[ -f ".github/workflows" ] && echo "GitHub Actions CI"

# Git status
git status --short
git log --oneline -5
```

### Output Format

Present the inventory as:

```
Discovery complete:
  Skills: N installed (list names)
  MCP: N servers (list names)
  CLI: list tools
  Project: language, framework, tooling
  Git: current branch, recent commits
```

This inventory drives all downstream decisions.

## Analysis

After discovery, analyze the user's goal to understand what needs to be done.

### Process

1. **Parse the goal** — What is the user asking for?
2. **Identify task type** — Is this:
   - New feature (build something new)
   - Bug fix (something is broken)
   - Refactor (improve existing code)
   - Full project (end-to-end build)
   - Research (understand something)
   - Maintenance (update deps, clean up, etc.)
3. **Identify scope** — How big is this?
   - Single file change
   - Multi-file feature
   - Full project
4. **Identify constraints** — What limits exist?
   - Time constraints
   - Technology constraints
   - Existing code constraints

### Output

Produce a brief analysis:

```
Goal: {restated goal}
Type: {task type}
Scope: {scope assessment}
Constraints: {identified constraints}
```

## Phase Detection (LLM-Driven)

Decompose the goal into logical phases using reasoning. No predefined templates — think from first principles.

### Process

1. **What needs to happen first?** Usually planning/research/setup
2. **What depends on what?** Order phases by dependency
3. **What skills can handle each phase?** Reference discovered inventory
4. **What's the minimal viable set of phases?** YAGNI — don't over-decompose

### Phase Naming Convention

Each phase gets:
- A descriptive name (e.g., "Plan & Design", "Implement Auth", "Write Tests")
- A clear goal (what "done" looks like for this phase)
- An estimated complexity (simple/medium/complex)

### Example Decompositions

**Full project: "Build a REST API with auth and tests"**
```
Phase 1: Plan & Design → Goal: implementation plan exists
Phase 2: Implement Core → Goal: API endpoints working
Phase 3: Add Auth → Goal: JWT auth working
Phase 4: Write Tests → Goal: tests passing
Phase 5: Review & Verify → Goal: code reviewed, verified
Phase 6: Ship → Goal: merged/deployed
```

**Bug fix: "Fix the login timeout error"**
```
Phase 1: Diagnose → Goal: root cause identified
Phase 2: Fix → Goal: bug fixed
Phase 3: Verify → Goal: fix verified, tests pass
```

**Small task: "Add a health check endpoint"**
```
Phase 1: Implement → Goal: endpoint working
Phase 2: Test → Goal: test passing
```

### Output

Produce an ordered phase list:

```
Phase 1: {name} — {goal}
Phase 2: {name} — {goal}
Phase 3: {name} — {goal}
...
```

## Skill Mapping

For each detected phase, map it to the best available skill from the discovered inventory.

### Process

For each phase:
1. **Understand the phase intent** — What does this phase need to accomplish?
2. **Search discovered skills** — Which skill descriptions match this intent?
3. **Search MCP tools** — Are there MCP tools that help with this phase?
4. **Search CLI tools** — Are there CLI tools needed for this phase?
5. **Select best fit** — Pick the skill/tool that best matches
6. **Fallback** — If no skill fits, handle directly with LLM reasoning

### Mapping Logic

Match phase intent to skill descriptions:

| Phase Intent Keywords | Skill Description Keywords |
|---|---|
| plan, design, spec, architecture | plan, design, spec, brainstorm |
| implement, build, create, code | implement, develop, code, build |
| test, verify, validate | test, tdd, verify, validation |
| debug, fix, diagnose, troubleshoot | debug, diagnose, fix, troubleshoot |
| review, check, quality | review, quality, check |
| deploy, ship, merge, release | ship, deploy, merge, release |
| understand, explore, research | understand, explore, research, analyze |
| refactor, improve, clean | refactor, improve, architecture |
| issue, ticket, task | issue, triage, ticket |

### MCP Tool Mapping

| Phase Intent | MCP Tools |
|---|---|
| Understanding codebase | codegraph_* tools |
| Testing web UI | playwright tools |
| Fetching docs | context7 tools |

### CLI Tool Mapping

| Phase Intent | CLI Tools |
|---|---|
| Version control | git |
| Package management | npm, pip, cargo, go |
| Testing | pytest, jest, go test |
| Building | npm build, cargo build, mvn package |

### Output

Produce phase-to-skill assignments:

```
Phase 1: {name} → Skill: {skill_name} + Tools: {tools}
Phase 2: {name} → Skill: {skill_name} + Tools: {tools}
Phase 3: {name} → Direct (no matching skill) + Tools: {tools}
```

### Important Notes

- **No hardcoded skill names.** The mapping is purely based on discovered inventory.
- **Skills are optional.** If no skill matches, the agent handles the phase directly.
- **MCP and CLI tools supplement skills.** A phase might use a skill AND tools together.
- **Multiple skills per phase is allowed.** If two skills are relevant, use both.

## Prompt Generation (Hybrid)

For each phase, generate a tailored prompt using templates + LLM customization.

### Process

For each phase:
1. **Select the skill** (from mapping)
2. **Load base template** (see templates below)
3. **Inject discovery context:**
   - Project language/framework (from discovery)
   - Available tools (from discovery)
   - File paths (from project scan)
4. **Inject task-specific details:**
   - What was built in previous phases
   - Outputs from prior phases (plan file path, test results, etc.)
   - Constraints from the original input
5. **Output final prompt**

### Base Templates

#### Planning Phase Template
```markdown
You are in the PLANNING phase.

**Goal:** {phase_goal}
**Project Context:** {language}, {framework}, {tooling}
**Available Tools:** {discovered_tools}
**User's Original Request:** {original_input}

Create a detailed implementation plan. Save to docs/superpowers/plans/.
Use a planning skill if available.
```

#### Implementation Phase Template
```markdown
You are in the IMPLEMENTATION phase.

**Goal:** {phase_goal}
**Plan:** {plan_file_path_or_summary}
**Project Context:** {language}, {framework}, {tooling}
**Available Tools:** {discovered_tools}
**Previous Phase Output:** {prior_results}

Implement according to the plan. Use TDD if testing skills are available.
Commit frequently with descriptive messages.
```

#### Testing Phase Template
```markdown
You are in the TESTING phase.

**Goal:** {phase_goal}
**What was built:** {implementation_summary}
**Project Context:** {language}, {framework}, {tooling}
**Test Framework:** {detected_test_framework}
**Available Tools:** {discovered_tools}

Write and run tests. Ensure all tests pass before completing.
```

#### Review Phase Template
```markdown
You are in the REVIEW phase.

**Goal:** {phase_goal}
**What to review:** {files_changed}
**Project Context:** {language}, {framework}, {tooling}
**Available Tools:** {discovered_tools}

Review the code for quality, correctness, and completeness.
Use code review skills if available.
```

#### Debug Phase Template
```markdown
You are in the DEBUG phase.

**Goal:** {phase_goal}
**Problem:** {problem_description}
**Project Context:** {language}, {framework}, {tooling}
**Available Tools:** {discovered_tools}

Diagnose and fix the issue. Use systematic debugging if skill available.
```

#### Ship Phase Template
```markdown
You are in the SHIP phase.

**Goal:** {phase_goal}
**What to ship:** {changes_summary}
**Project Context:** {language}, {framework}, {tooling}
**Available Tools:** {discovered_tools}

Prepare for shipping: run final tests, build, create PR or merge.
Use finishing skills if available.
```

### LLM Customization

After loading the template, customize it by adding:
- **Task-specific file paths** — Which files to create/modify
- **Dependencies from prior phases** — What was built, what tests exist
- **Edge cases** — Specific to the user's goal
- **Adjusted instructions** — Based on project state

### Fallback

If no template matches the phase type, generate the prompt from scratch:

```markdown
You are in the {phase_name} phase.

**Goal:** {phase_goal}
**Project Context:** {discovery_inventory}
**Previous Phases:** {prior_results}
**Original Goal:** {user_goal}

Accomplish the phase goal. Use available tools and skills as needed.
```

## Execution

Execute each phase sequentially. Never pause for confirmation between phases.

### Phase Execution Loop

```
For each phase in order:
  1. Mark phase as in_progress (TaskUpdate)
  2. Generate prompt (from Prompt Generation)
  3. Invoke the mapped skill with the prompt
     - If skill exists: Use Skill tool with skill name
     - If no skill: Execute directly with generated prompt
  4. Monitor until phase completes (see Monitoring)
  5. Mark phase as completed (TaskUpdate)
  6. Record phase output for next phase's context
  7. Move to next phase
```

### Skill Invocation

When invoking a skill:
```
Skill: {skill_name}
Args: {generated_prompt_content}
```

When no skill matches, execute directly:
- Use the generated prompt as your instruction
- Use available MCP tools and CLI tools as needed
- Commit work frequently

### Phase Output Recording

After each phase completes, record:
- What was accomplished
- Key file paths created/modified
- Test results (if applicable)
- Any issues encountered

This becomes context for the next phase.

## Monitoring

Poll-based status checking during each phase.

### Poll Cycle

Check these indicators periodically:

1. **Task list status**
   ```
   TaskList → Check if current phase's tasks are completed
   ```

2. **Git status**
   ```bash
   git status --short
   git log --oneline -3
   ```

3. **Test results** (if test framework detected)
   ```bash
   # Node.js
   npm test 2>&1 | tail -20
   # Python
   pytest --tb=short 2>&1 | tail -20
   ```

4. **Build output** (if build tool detected)
   ```bash
   # Node.js
   npm run build 2>&1 | tail -10
   # Python
   python -m py_compile src/**/*.py
   ```

### Phase Completion Criteria

A phase is complete when:
- All tasks in the phase are marked completed
- No test failures
- No build errors
- Phase goal is achieved

### Phase Failure Handling

```
If phase fails:
  1. Analyze failure reason from poll results
  2. Adjust prompt:
     - Add more context about the failure
     - Fix incorrect assumptions
     - Provide more specific instructions
  3. Retry same skill (max 2 retries)
  4. If still failing:
     - Try alternative skill (max 1 alternative)
     - If alternative also fails:
       - Skip phase if non-critical, log warning
       - Report blocker if critical (testing, verification)
  5. Continue to next phase
```

### Retry Prompt Adjustment

When retrying, add to the prompt:
```markdown
**PREVIOUS ATTEMPT FAILED:**
- Error: {error_description}
- What was tried: {what_was_attempted}
- Adjusted approach: {new_approach}

Please try again with the adjusted approach.
```

## Completion

After all phases execute, verify the project is done.

### Final Verification

Run these checks:

1. **Build check**
   ```bash
   # Detect and run appropriate build command
   [ -f "package.json" ] && npm run build
   [ -f "Cargo.toml" ] && cargo build
   [ -f "go.mod" ] && go build ./...
   ```

2. **Test check**
   ```bash
   # Detect and run appropriate test command
   [ -f "package.json" ] && npm test
   [ -f "requirements.txt" ] && pytest
   [ -f "Cargo.toml" ] && cargo test
   [ -f "go.mod" ] && go test ./...
   ```

3. **Lint check** (if linter configured)
   ```bash
   [ -f ".eslintrc.js" ] && npx eslint .
   [ -f "setup.cfg" ] && flake8 .
   ```

4. **Git status**
   ```bash
   git status
   git log --oneline -10
   ```

### Completion Report

If all checks pass, report:

```
AUTOPILOT COMPLETE

Goal: {original_goal}
Phases Completed: {phase_count}

Summary:
- {phase_1}: {result}
- {phase_2}: {result}
- {phase_3}: {result}

Verification:
- Build: PASS
- Tests: PASS
- Lint: PASS (or N/A)

All done! Project goal achieved.
```

### If Verification Fails

If any check fails:
1. Add a new phase to fix the issue
2. Execute the fix phase
3. Re-run verification
4. Repeat until all checks pass

Never report completion with failing checks.

## Main Orchestrator Flow

This is the complete flow that ties everything together.

### Step-by-Step Execution

```
1. RECEIVE INPUT
   - Read user's goal from argument-hint
   - Announce: "I'm using the Autopilot skill to autonomously accomplish: {goal}"

2. RUN DISCOVERY
   - Scan skills directory → build skill catalog
   - Scan MCP servers → note available tools
   - Scan CLI tools → note available commands
   - Scan project context → detect language/framework/tooling
   - Present inventory summary

3. RUN ANALYSIS
   - Parse goal
   - Identify task type (feature/fix/refactor/project/research/maintenance)
   - Identify scope (single-file/multi-file/full-project)
   - Identify constraints
   - Present analysis summary

4. DETECT PHASES
   - Decompose goal into ordered phases
   - Each phase: name + goal + complexity
   - Present phase plan

5. MAP SKILLS
   - For each phase: match to discovered skill
   - Map MCP tools and CLI tools per phase
   - Present skill assignments

6. CREATE TASKS
   - TaskCreate for each phase
   - Set up dependencies (each phase blocks the next)
   - Present task list

7. EXECUTE PHASES
   - For each phase (in order):
     a. TaskUpdate: mark in_progress
     b. Generate prompt (template + customization)
     c. Invoke skill or execute directly
     d. Monitor until complete
     e. TaskUpdate: mark completed
     f. Record output for next phase

8. FINAL VERIFICATION
   - Run build check
   - Run test check
   - Run lint check
   - Check git status

9. REPORT COMPLETION
   - Present completion summary
   - List all phases and results
   - Confirm project goal achieved
```

### Error Recovery

At any point if a hard blocker is encountered:
1. Stop execution
2. Report the blocker clearly
3. Explain what was tried
4. Wait for user input

Resume from where it stopped once the blocker is resolved.
