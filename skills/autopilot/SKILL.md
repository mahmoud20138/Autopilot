---
name: autopilot
description: Autonomous orchestrator that takes a goal, discovers available tools, decomposes into phases, maps phases to skills, executes, and monitors until the project is done. Use when user wants full autonomous execution of a complex goal.
argument-hint: "The goal to accomplish autonomously"
---

# Autopilot Agent Mode

Fully autonomous orchestrator. Takes a user's goal, runs it to completion without human intervention.

**Announce at start:** "I'm using the Autopilot skill to autonomously accomplish: {user_goal}"

**Core principle:** Never implement anything directly. Orchestrate existing skills. Each phase delegates to a real skill.

**Portability:** Works on any PC (macOS, Linux, Windows). Dynamically discovers whatever skills, plugins, MCP servers, and CLI tools are installed. No hardcoded skill names.

## Pipeline

```
Input → Discovery → Launch Tracker → Analysis → Phase Detection → Skill Mapping → Prompt Generation → Execution → Monitor → Stop Tracker → Done
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

Check multiple known skills directories. Use your platform's native file-system tools instead of shell commands for maximum portability:

| CLI | Skills Directory |
|-----|----------------|
| Claude Code | `~/.claude/skills/` |
| OpenClaude | `~/.openclaude/skills/` |
| GitHub Copilot | `~/.config/github-copilot/skills/` |
| Cursor | `~/.cursor/skills/` |
| Kilo | `~/.config/kilo/skills/` |

For each directory that exists, iterate over subdirectories looking for `SKILL.md` files. Read the YAML frontmatter to extract:
- `name:` field
- `description:` field

Build a catalog: `[{"name": "skill-name", "description": "what it does"}, ...]`

### Step 2: Scan MCP Servers

Check what MCP tools are available by looking at tool names in the system context. Common patterns:
- `codegraph_*` — CodeGraph server available
- `mcp__plugin_playwright_*` — Playwright available
- `mcp__plugin_context7_*` — Context7 available

### Step 3: Scan CLI Tools

Check PATH for common tools. Use your platform's native command to probe each tool:

```bash
# macOS / Linux
for cmd in git node npm python pip pytest cargo go java mvn gradle docker; do
  command -v $cmd && echo "$cmd: available"
done
```

```powershell
# Windows
$tools = 'git','node','npm','python','pip','pytest','cargo','go','java','mvn','gradle','docker'
foreach ($cmd in $tools) { if (Get-Command $cmd -ErrorAction SilentlyContinue) { Write-Output "$cmd: available" } }
```

### Step 4: Scan Project Context

Check for project indicators. Use your platform's file-system tooling (Read, Glob, Bash) to probe:

- `package.json` → Node.js project
- `requirements.txt` or `pyproject.toml` → Python project
- `Cargo.toml` → Rust project
- `go.mod` → Go project
- `pom.xml` → Java/Maven project
- `build.gradle` → Java/Gradle project
- `jest.config.js` → Jest testing
- `pytest.ini` or `setup.cfg` → Pytest setup
- `.github/workflows/` directory → GitHub Actions CI

```bash
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

## Launch Tracker (Automatic — No Options)

**The tracker and dashboard start AUTOMATICALLY. No extra steps. No options. Everything begins when autopilot is called.**

As soon as Discovery completes, the orchestrator MUST:

```bash
# 1. Setup
mkdir -p .autopilot
rm -f .autopilot/events.ndjson

# 2. Write initial state
cat > .autopilot/state.json << 'EOF'
{
  "goal": "{user_goal}",
  "status": "running",
  "started_at": $(date +%s),
  "current_phase": 0,
  "phases": [],
  "skills_used": {},
  "mcps_used": {},
  "clis_used": {},
  "files_changed": [],
  "errors": [],
  "total_duration_s": 0
}
EOF

# 3. Emit discovery event
echo '{"t":"discovery","ts":'$(date +%s)',"data":{...}}' >> .autopilot/events.ndjson

# 4. Start tracker server in background — auto-opens browser (default port 8765)
python3 tracker/tracker.py &
```

**That's it.** The dashboard is now live. All subsequent phases stream events automatically.

### Live Event Streaming

Every state change during execution MUST emit an event to `.autopilot/events.ndjson`:

| Action | Event Type | When |
|--------|-----------|------|
| Phase starts | `phase_start` | Before executing a phase |
| Skill invoked | `skill_invoked` | After calling a skill |
| MCP tool used | `mcp_called` | After MCP tool call |
| CLI command run | `cli_called` | After CLI command |
| File changed | `file_changed` | After creating/modifying a file |
| Phase ends | `phase_end` | After phase completes or fails |
| Retry | `phase_start` | When retrying a failed phase |
| Final check | `verification` | After build/test/lint checks |
| All done | `complete` | After all phases pass |

After each event:
1. Append the event to `.autopilot/events.ndjson`
2. Update `.autopilot/state.json` with the new state
3. The dashboard auto-refreshes via SSE — no manual action needed

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

**LIVE TRACKING:** Every action MUST emit an event to `.autopilot/events.ndjson` so the dashboard shows real-time progress.

### Phase Execution Loop

```
For each phase in order:
  1. Emit "phase_start" event → dashboard shows phase as in_progress (yellow pulse)
  2. Mark phase as in_progress (TaskUpdate)
  3. Generate prompt (from Prompt Generation)
  4. Invoke the mapped skill with the prompt
     - If skill exists: Use Skill tool with skill name
     - If no skill: Execute directly with generated prompt
     - After skill invocation: emit "skill_invoked" event → dashboard updates skill usage bar
     - Track MCP/CLI calls during execution
     - After each file change: emit "file_changed" event → dashboard shows file in list
  5. Monitor until phase completes (see Monitoring)
  6. Emit "phase_end" event → dashboard shows phase as completed (green) or failed (red)
  7. Mark phase as completed (TaskUpdate)
  8. Record phase output for next phase's context
  9. Move to next phase
```

### Event Emission Helper

After each state change, emit an event:

```bash
# Append directly (cross-platform: works with any shell that supports echo/redirect)
echo '{"t":"<event_type>","ts":<unix_timestamp>,"data":{...}}' >> .autopilot/events.ndjson
```

After emitting the event, also update `.autopilot/state.json` so the dashboard has the latest snapshot.

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
   Run the project's test command directly and review the output:
   ```bash
   npm test
   pytest --tb=short
   cargo test
   go test ./...
   ```

4. **Build output** (if build tool detected)
   Run the project's build command directly and review the output:
   ```bash
   npm run build
   cargo build
   python -m compileall src
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

### Stop Tracker

Before generating the completion report, stop the tracker:

1. Set `status: "complete"` in `.autopilot/state.json`
2. Emit a "complete" event to `.autopilot/events.ndjson`
3. The dashboard will show the final state
4. Kill the tracker server process:
   ```bash
   kill $(pgrep -f tracker.py) 2>/dev/null || true
   ```

### Final Verification

Run these checks using your platform's native tools to detect project type:

1. **Build check** — run the project's build command if a build config exists (`package.json`, `Cargo.toml`, `go.mod`, `pom.xml`, `build.gradle`).

2. **Test check** — run the project's test command (`npm test`, `pytest`, `cargo test`, `go test ./...`, etc.).

3. **Lint check** — run a linter if configured (`.eslintrc.js`, `setup.cfg`, `pyproject.toml`, etc.).

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

3. LAUNCH TRACKER (AUTOMATIC)
   - mkdir -p .autopilot && rm -f .autopilot/events.ndjson
   - Write initial state.json
   - Emit discovery event
   - Run: python3 tracker/tracker.py &
   - Dashboard auto-opens in browser (tracker.py handles this)
   - All subsequent phases stream live to dashboard automatically

4. RUN ANALYSIS
   - Parse goal
   - Identify task type (feature/fix/refactor/project/research/maintenance)
   - Identify scope (single-file/multi-file/full-project)
   - Identify constraints
   - Present analysis summary
   - Emit analysis event → dashboard updates live

5. DETECT PHASES
   - Decompose goal into ordered phases
   - Each phase: name + goal + complexity
   - Present phase plan
   - Emit phase detection event → dashboard shows phase pipeline

6. MAP SKILLS
   - For each phase: match to discovered skill
   - Map MCP tools and CLI tools per phase
   - Present skill assignments

7. CREATE TASKS
   - TaskCreate for each phase
   - Set up dependencies (each phase blocks the next)
   - Present task list

8. EXECUTE PHASES (LIVE TRACKING)
   - For each phase (in order):
     a. Emit phase_start event → dashboard shows phase as in_progress (yellow)
     b. TaskUpdate: mark in_progress
     c. Generate prompt (template + customization)
     d. Invoke skill or execute directly
        - After skill invocation: emit skill_invoked event → dashboard updates skill bar
        - Track MCP/CLI calls during execution
        - After each file change: emit file_changed event → dashboard shows file
     e. Monitor until complete
     f. Emit phase_end event → dashboard shows phase as completed (green)
     g. TaskUpdate: mark completed
     h. Record output for next phase

9. FINAL VERIFICATION
   - Emit verification event → dashboard shows build/test/lint status
   - Run build check
   - Run test check
   - Run lint check
   - Check git status

10. STOP TRACKER & REPORT COMPLETION
    - Set status to "complete" in state.json
    - Emit complete event → dashboard shows final summary
    - Stop tracker server
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

## Parallel Execution

When phases are independent, execute them concurrently to save time.

### Identifying Parallel Phases

Two phases can run in parallel if:
- Neither depends on the other's output
- They don't modify the same files
- They don't share state (e.g., both writing to the same test file)

### Parallel Execution Pattern

```
Phase 1: Plan & Design → blocks Phase 2, 3
Phase 2: Implement Auth ─┐→ both run in parallel → block Phase 4
Phase 3: Implement API  ─┘
Phase 4: Write Tests → blocks Phase 5
Phase 5: Review & Ship
```

### How to Execute in Parallel

When phases are independent:
1. Create tasks for all parallel phases
2. Use your platform's background execution capability (e.g., `run_in_background` if available, or Task tool with subagents)
3. Monitor all background agents
4. Wait for all to complete before starting dependent phases

### When NOT to Parallelize

- When phases share files or state
- When one phase's output is another's input
- When the project is small enough that parallelism adds overhead
- When debugging (sequential is better for tracing issues)

## Progress Reporting

Report progress at natural milestones, not after every action.

### When to Report

- After each phase completes
- After a significant milestone within a phase (e.g., "auth module done")
- When encountering a blocker
- Before starting a complex phase

### Progress Format

```
Progress: Phase 2/5 — Implement Auth
  ✓ Phase 1: Plan & Design (complete)
  → Phase 2: Implement Auth (in progress — JWT middleware done, routes pending)
  ○ Phase 3: Write Tests
  ○ Phase 4: Review
  ○ Phase 5: Ship
```

### What NOT to Report

- Every file read or write
- Every command executed
- Intermediate debugging steps
- Routine task updates

## Enhanced Error Recovery

Beyond basic retry, use these patterns for robust error handling.

### Pattern 1: Root Cause Analysis

When a phase fails:
1. Read the error message carefully
2. Check if it's a known issue (search error text)
3. Identify if it's:
   - **Configuration error** — wrong paths, missing env vars
   - **Dependency error** — missing package, version mismatch
   - **Logic error** — code bug, incorrect assumption
   - **Environment error** — OS-specific, permission issue

### Pattern 2: Incremental Rollback

If a phase partially succeeds then fails:
1. Identify what was completed successfully
2. Identify what failed
3. Only retry the failed part, not the entire phase

### Pattern 3: Alternative Approaches

When the primary approach fails:
1. Try the simplest fix first
2. If that fails, try a different library/tool
3. If that fails, simplify the requirement
4. If still failing, report as a blocker

### Pattern 4: Graceful Degradation

For non-critical features:
1. If implementation is too complex, simplify
2. If a dependency is unavailable, find alternatives
3. If a feature can't be fully implemented, implement a subset
4. Document what was simplified and why

### Error Recovery Decision Tree

```
Phase fails
├── Is it a quick fix? (< 5 min)
│   └── Yes → Fix and retry
├── Is it a dependency issue?
│   └── Yes → Install/find alternative
├── Is it a logic error?
│   └── Yes → Debug, fix, retry
├── Is it an environment issue?
│   └── Yes → Check OS/permissions, adapt
└── None of the above?
    └── Try alternative skill/approach
        └── Still failing?
            └── Report blocker (if critical) or skip (if non-critical)
```
