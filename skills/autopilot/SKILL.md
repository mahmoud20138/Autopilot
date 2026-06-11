---
name: autopilot
description: Autonomous orchestrator that takes a goal, discovers available tools and skills, decomposes into phases, maps phases to skills, executes, and monitors until the project is done. Use when the user wants full autonomous execution of a complex goal.
argument-hint: "The goal to accomplish autonomously"
---

# Autopilot Agent Mode

Fully autonomous orchestrator. Takes a user's goal, runs it to completion without human intervention.

**Announce at start:** "I'm using the Autopilot skill to autonomously accomplish: {user_goal}"

**Core principle:** Orchestrate existing skills and tools — never implement phases from scratch when a skill already covers the task. Each phase delegates to the most appropriate skill or set of tools.

**Portability:** Works with Claude Code, OpenClaude, GitHub Copilot CLI, Cursor, and Kilo. Dynamically discovers available skills, MCP servers, integrations, and CLI tools — no hardcoded assumptions.

## Pipeline

```
Input → Memory Check → Discovery → Analysis → Phase Detection → Skill/Tool Mapping → Session Plan → Execution → Verification → Completion Report
```

## Stop Conditions

**Stop only when:**
- All phases completed successfully
- Final verification passes (typecheck, build, runtime check, no blockers)
- Project goal achieved

**Never stop for:**
- "Should I continue?" prompts between phases
- Progress summaries mid-execution
- Asking permission to proceed to the next phase

**Pause only if:**
- Hard blocker that no skill or tool can resolve (missing external credential, genuinely ambiguous requirement with no safe assumption)
- Report the blocker precisely and wait for user input
- Resume from the current phase once the blocker is resolved

---

## Step 0 — Memory Check (Always First)

Before any other work, read `.agents/memory/MEMORY.md` and open any topic files relevant to the current goal. Apply documented constraints and past decisions immediately. If a past decision conflicts with what you observe now, trust the code and update the memory after the task.

---

## Step 1 — Discovery

Build an inventory of everything available on this system. Run discovery once per autopilot session.

### 1a. Scan Skills Directory

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

Build a catalog: `[{"name": "skill-name", "description": "what it does", "path": "path/to/skill"}, ...]`

### 1b. Scan MCP Servers

Check what MCP tools are available by looking at tool names in the system context. Common patterns:
- `codegraph_*` — CodeGraph server available (use for codebase understanding, symbol lookup, impact analysis)
- `mcp__context7__*` — Context7 available (use for library documentation lookup)
- `mcp__plugin_playwright_*` — Playwright available (use for E2E testing)

When Codegraph is available, use it BEFORE writing or editing code:
- `codegraph_search` — Find symbols by name (faster than grep)
- `codegraph_context` — Get comprehensive context for a task (composes search + callers + callees)
- `codegraph_callers` / `codegraph_callees` — Understand dependencies
- `codegraph_impact` — Analyze blast radius before changing a symbol
- `codegraph_explore` — Deep dive into unfamiliar modules

### 1c. Scan CLI Tools

Check PATH for common tools relevant to the project:

```bash
# macOS / Linux
for cmd in git node npm pnpm python pip pytest cargo go java mvn gradle docker; do
  command -v $cmd && echo "$cmd: available"
done
```

```powershell
# Windows
$tools = 'git','node','npm','pnpm','python','pip','pytest','cargo','go','java','mvn','gradle','docker'
foreach ($cmd in $tools) { if (Get-Command $cmd -ErrorAction SilentlyContinue) { Write-Output "$cmd: available" } }
```

### 1d. Scan Project Context

Detect language/framework indicators and existing artifacts:

```bash
git status --short
git log --oneline -5
```

Check for project indicators:
- `package.json` → Node.js project
- `requirements.txt` or `pyproject.toml` → Python project
- `Cargo.toml` → Rust project
- `go.mod` → Go project
- `pom.xml` → Java/Maven project
- `build.gradle` → Java/Gradle project
- `.github/workflows/` directory → GitHub Actions CI

### 1e. Scan Environment Variables

Check what env vars are set and what may be missing. Do not display actual values — only list key names and whether they are set.

### Discovery Output

Present the inventory concisely:

```
Discovery complete:
  Skills: N installed (list names)
  MCP: N servers (list names)
  CLI: list available tools
  Project: language, framework, tooling detected
  Env vars: list set keys (not values), list missing critical ones
  Git: current branch, recent commits
```

---

## Step 2 — Analysis

Parse the goal to understand what needs to be done before decomposing phases.

1. **Parse the goal** — What is the user asking for exactly?
2. **Identify task type** — New feature, bug fix, refactor, full project build, research, maintenance?
3. **Identify scope** — Single file, multi-file feature, multi-artifact project?
4. **Identify constraints** — Existing tech stack, env vars needed, external credentials required?
5. **Identify parallelism opportunities** — Which phases are independent and could run concurrently?

Output:

```
Goal: {restated in one sentence}
Type: {task type}
Scope: {scope assessment}
Constraints: {identified constraints or "none"}
Parallelism: {phases that can run in parallel, if any}
```

---

## Step 3 — Phase Detection

Decompose the goal into the **minimal viable set** of logical phases. Think from first principles — no rigid templates. YAGNI: don't over-decompose.

For each phase, determine:
- **Name** — short descriptive label (e.g. "Set up DB schema", "Implement auth routes")
- **Goal** — what "done" looks like (verifiable output)
- **Complexity** — simple / medium / complex
- **Dependencies** — which prior phases must complete first (drives sequencing and parallelism)
- **Criticality** — blocking (must pass) or non-blocking (can skip with warning)

**Dynamic sub-phasing:** If a phase is Complex, break it into verifiable sub-tasks before executing it.

**Parallelism rule:** If two phases share no dependency, they are candidates for parallel execution. Plan parallel branches explicitly.

Phase list format:

```
Phase 1: {name} — {goal} [complexity: simple] [deps: none] [critical]
Phase 2: {name} — {goal} [complexity: medium] [deps: Phase 1] [critical]
Phase 3: {name} — {goal} [complexity: simple] [deps: Phase 1] [non-blocking]
Phase 3+4 (parallel): {name-A} and {name-B} — independent, can run concurrently
```

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

---

## Step 4 — Skill/Tool Mapping

For each phase, select the best available skill or tool from the discovered inventory.

Decision order:
1. **Skill match** — Does a skill from the catalog cover this phase? Load and follow it.
2. **MCP tool match** — Do MCP tools provide needed capability (codegraph for understanding, context7 for docs, playwright for E2E)?
3. **Integration/connection match** — Does a configured connection provide the needed capability?
4. **CLI tool** — Is a CLI tool the right executor (e.g. `pnpm run typecheck`, `git`)?
5. **Direct execution** — No skill or tool fits; handle with native tools (bash, read/write/edit, grep, glob).

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
| Understanding codebase | `codegraph_search`, `codegraph_context`, `codegraph_explore` |
| Finding callers/callees | `codegraph_callers`, `codegraph_callees` |
| Impact analysis | `codegraph_impact` |
| Fetching library docs | `context7` tools |
| Testing web UI | `playwright` tools |

### CLI Tool Mapping

| Phase Intent | CLI Tools |
|---|---|
| Version control | git |
| Package management | npm, pnpm, pip, cargo, go |
| Testing | pytest, jest, go test, cargo test |
| Building | npm run build, cargo build, mvn package |

Produce a mapping table:

```
Phase 1: {name} → Skill: {skill_name}, MCP: {tools}, CLI: {tools}
Phase 2: {name} → Skill: {skill_name}, MCP: {tools}, CLI: {tools}
Phase 3: {name} → Direct, MCP: {tools}, CLI: {tools}
```

**Important:** No hardcoded skill names. The mapping is purely based on discovered inventory. Skills are optional — if no skill matches, handle the phase directly.

---

## Step 5 — Session Plan

Write `.local/session_plan.md` as a checkpoint file before executing anything. This enables resume-from-checkpoint if the session is interrupted.

Format:

```markdown
# Autopilot Session Plan

## Goal
{original goal}

## Discovery Summary
{condensed inventory}

## Tasks

### T001: {Phase 1 name}
- **Blocked By**: []
- **Skill**: {skill or Direct}
- **MCP**: {mcp tools}
- **CLI**: {cli tools}
- **Done When**: {verifiable acceptance criterion}
- **Criticality**: blocking
- **Status**: pending

### T002: {Phase 2 name}
- **Blocked By**: [T001]
- **Skill**: {skill or Direct}
...
```

Update status fields (`pending` → `in_progress` → `done` / `failed` / `skipped`) as phases execute. This is the single source of truth for progress.

---

## Step 6 — Execution

Execute each phase in dependency order. Mark phases `in_progress` in the session plan before starting, `done` after success.

### Per-Phase Loop

```
For each phase (respecting dependency order):
  1. Update session plan: status → in_progress
  2. Read the mapped skill's SKILL.md if not already loaded
  3. Generate prompt (see Prompt Generation below)
  4. Execute the phase using the mapped skill/tools
  5. SELF-REVIEW: Does the output meet the phase's "Done When" criterion?
     - Check for TypeScript errors: pnpm run typecheck
     - Check for runtime errors: restart workflow, check logs
     - Check for broken imports: grep for unresolved symbols
  6. If output is correct: update session plan → done; record key output for next phases
  7. If output has errors: enter Retry Logic (see below)
  8. Move to next phase
```

### Prompt Generation (Hybrid)

For each phase, generate a tailored prompt using templates + LLM customization:

1. **Select the skill** (from mapping)
2. **Load base template** (see below)
3. **Inject discovery context** — project language/framework, available tools, file paths
4. **Inject task-specific details** — prior phase outputs, constraints
5. **Output final prompt**

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

### Parallelism Execution

For phases with no shared dependencies, launch them concurrently using the Agent tool:

```
Phase 1: Plan & Design → blocks Phase 2, 3
Phase 2: Implement Auth ─┐→ both run in parallel → block Phase 4
Phase 3: Implement API  ─┘
Phase 4: Write Tests → blocks Phase 5
Phase 5: Review & Ship
```

When phases are independent:
1. Create tasks for all parallel phases
2. Use the Agent tool with `run_in_background: true` for concurrent execution
3. Monitor all background agents
4. Wait for all to complete before starting dependent phases

**When NOT to parallelize:**
- When phases share files or state
- When one phase's output is another's input
- When the project is small enough that parallelism adds overhead
- When debugging (sequential is better for tracing issues)

### Context Budget Rule

Each file read consumes context. Never read more than 10 files in a single phase. If you need broad codebase understanding:
- Use `codegraph_context` or `codegraph_explore` (when Codegraph MCP is available)
- Use the `Explore` subagent for broad searches
- Use grep and glob to locate files before reading — never speculatively read files you may not need

### Progress Cadence

In long runs, emit a one-line progress note at each phase boundary:
```
Phase 3/7 complete — auth routes live, moving to billing
```
Do not pause for acknowledgement. Keep notes to a single sentence; never dump full summaries mid-run.

---

## Step 7 — Retry Logic

```
If a phase fails:
  1. Read the error precisely (from bash output, logs, or typecheck output).
  2. Identify root cause: wrong assumption, missing dependency, env var, type error, import error?
  3. Fix the specific issue and re-run the phase (attempt 1 of 2).

  If still failing after retry 1:
  4. Search for a more specific skill matching the phase topic + error keyword.
  5. If a better skill is found: load it and retry (attempt 2 of 2).
  6. If no better skill found: try one alternative approach (different library, simpler implementation).

  If still failing after attempt 2:
  7. For non-blocking phase: log a warning in the session plan, set status → skipped, continue.
  8. For blocking phase: stop execution, report the blocker clearly (what was tried, what failed, what's needed), wait for user input.
```

### Enhanced Error Recovery Patterns

**Root Cause Analysis:**
1. Read the error message carefully
2. Check if it's a known issue (search error text)
3. Identify the error type:
   - **Configuration error** — wrong paths, missing env vars
   - **Dependency error** — missing package, version mismatch
   - **Logic error** — code bug, incorrect assumption
   - **Environment error** — OS-specific, permission issue

**Incremental Rollback:**
If a phase partially succeeds then fails:
1. Identify what was completed successfully
2. Identify what failed
3. Only retry the failed part, not the entire phase

**Graceful Degradation (for non-critical features):**
1. If implementation is too complex, simplify
2. If a dependency is unavailable, find alternatives
3. If a feature can't be fully implemented, implement a subset
4. Document what was simplified and why

Never silently swallow errors. Always log failure reason in the session plan.

---

## Step 8 — Monitoring & Quality

After each implementation phase, run the relevant quality checks before marking done.

| Project Type | Typecheck Command | Build Command |
|---|---|---|
| Node/TS (pnpm workspace) | `pnpm run typecheck` | `pnpm --filter @workspace/<slug> run build` |
| Node/TS (npm) | `npx tsc --noEmit` | `npm run build` |
| Python | `python -m mypy .` or `pyright` if available | n/a |
| Rust | `cargo check` | `cargo build` |
| Go | `go vet ./...` | `go build ./...` |
| Other | Detect from `package.json` / CI config | Detect from project |

**Linting (when configured):** Run `pnpm exec eslint src/` or `flake8` if a lint config exists. Non-blocking unless the project's `package.json` marks lint as a required check.

**Security (when relevant):** Run a security scan for any phase that introduces authentication, payments, or data storage. Check for hardcoded secrets, SQL injection, XSS vulnerabilities.

---

## Step 9 — Final Verification

After all phases complete, run a comprehensive check.

### Checks (adapt to project type)

1. **Typecheck** — Must exit 0 (TS/JS projects)
2. **Build** — Must exit 0
3. **Tests** — All tests must pass
4. **Lint** — Must pass if lint config exists
5. **Git status** — Confirm no unintended unstaged files
6. **Security scan** — No hardcoded secrets or obvious vulnerabilities

### If Any Check Fails

1. Diagnose the failure from logs / typecheck output.
2. Add a new ad-hoc `Fix` phase to the session plan.
3. Execute the fix.
4. Re-run verification.
5. Repeat until all checks pass.

Never report completion with failing checks.

---

## Step 10 — Completion Report

When all checks pass, present results and clean up.

**Cleanup:**
- Delete `.local/session_plan.md` (task complete, no longer needed)
- Update `.agents/memory/MEMORY.md` with any durable lessons, non-obvious decisions, or environment quirks discovered during execution (follow memory system rules — no secrets, no implementation changelogs, no derivable-from-code content)

**Report:**

```
AUTOPILOT COMPLETE

Goal: {original goal}
Phases: {N completed} / {N total}

Summary:
- {Phase 1}: {result one-liner}
- {Phase 2}: {result one-liner}
...

Verification:
- Typecheck: PASS
- Build: PASS
- Tests: PASS
- Lint: PASS / SKIPPED (no config found)
- Security: PASS / SKIPPED (not applicable)

Goal achieved.
```

---

## Optional Modes & Extensions

These are opt-in behaviors the user can request, or that autopilot can enable based on the goal. They are off by default unless the goal or risk profile warrants them.

### Dry-Run / Plan-Only Mode

When the user says "plan it", "show me the plan first", or "don't execute yet", run Steps 0–5 only. Write `.local/session_plan.md`, present the phase list and skill mapping, then stop and wait for approval. Do not execute any phase.

### Approval Gates (Destructive Actions)

For any phase that performs a destructive or far-reaching action, pause and confirm with the user before executing — even in full autonomous mode. Destructive actions include:
- Schema migrations that drop/alter columns, or any data deletion
- Dropping a database, truncating tables, or bulk updates
- Broad refactors touching many files or shared contracts (API/schema)
- Swapping a major library or framework
- Any write/update/delete against a connected integration

Read-only phases never require a gate.

### Code Review at Milestones

At each major milestone or phase-boundary (not every phase), invoke a code review agent to validate the trajectory before continuing. Use the `code-reviewer` or `security-reviewer` agents as appropriate.

### End-to-End Testing

For phases that ship user-facing flows, use the `e2e-runner` agent with Playwright to test against the running app. Lean toward testing large or complex changes; skip it for trivial ones. E2E tests catch bugs that typecheck and curl cannot.

### Resume from Checkpoint

If a session is interrupted, autopilot resumes by reading `.local/session_plan.md`: skip phases marked `done`, re-run the one marked `in_progress`, then continue. The session plan is the single source of truth for progress — never restart from Phase 1 if a plan already exists.

### Output Manifest

For multi-artifact or file-generating goals, maintain a running manifest in the session plan of every artifact created (slug + preview path) and every standalone file produced (path + purpose). Surface this manifest in the completion report so the user knows exactly what was delivered and where.

### Follow-Up Tasks

Before the completion report, propose up to 3 high-impact follow-ups (deferred scope, next steps, tech debt). Skip trivial items and anything already in scope.

---

## Main Orchestrator Flow (Summary)

1. **Memory Check** — Read MEMORY.md; apply past decisions
2. **Discovery** — Skills, MCP servers, CLI tools, project context, env vars, git context
3. **Analysis** — Goal, type, scope, constraints, parallelism opportunities
4. **Phase Detection** — Ordered phases with dependencies, complexity, criticality
5. **Skill/Tool Mapping** — Best skill, MCP tool, or CLI tool per phase
6. **Session Plan** — Write `.local/session_plan.md`; this is the checkpoint file
7. **Execution** — Sequential or parallel per dependency graph; retry on failure
8. **Monitoring** — Typecheck + build + tests after each implementation phase
9. **Final Verification** — Build, runtime, tests, lint, security
10. **Completion** — Clean up session plan, update memory, report

---

## Hard Rules

- **Never implement from scratch** what an existing skill already covers — read and follow the skill.
- **Never skip verification** — no phase is "done" until its acceptance criterion is confirmed.
- **Never report completion with failing checks** — fix first, report after.
- **Never read more than 10 files per turn** — use `codegraph_context` or `Explore` subagent for broad analysis.
- **Never expose secrets** — env vars, tokens, and credentials must never appear in output or memory.
- **Never use `console.log` in server code** — use proper logging libraries.
- **Never hardcode ports** — always read from `process.env.PORT`.
- **Never hardcode skill names** — always discover from the current system's inventory.
