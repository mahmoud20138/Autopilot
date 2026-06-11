# Full Project Workflow

```
/autopilot "build a user authentication system with JWT, tests, and documentation"
```

## Phases Detected

```
Phase 1: Plan & Design       → Goal: implementation plan exists
Phase 2: Implement Core      → Goal: API endpoints working
Phase 3: Add Auth            → Goal: JWT auth working
Phase 4: Write Tests         → Goal: tests passing
Phase 5: Review & Verify     → Goal: code reviewed, verified
Phase 6: Ship                → Goal: merged/deployed
```

## What Happens at Each Phase

### Phase 1 — Plan & Design
- Autopilot reads MEMORY.md for past decisions
- Scans skills, MCP servers, CLI tools, project context
- Uses `codegraph_context` to understand existing codebase structure
- Generates a planning prompt with project context + available tools
- Produces an implementation plan

### Phase 2 — Implement Core
- Loads the plan from Phase 1
- Uses `codegraph_search` to find existing route handlers and patterns
- Implements API endpoints following existing conventions
- Commits frequently with descriptive messages

### Phase 3 — Add Auth
- Uses `codegraph_impact` to analyze what auth changes will affect
- Implements JWT middleware and auth routes
- Runs typecheck after implementation

### Phase 4 — Write Tests
- Detects test framework from project (Jest, pytest, etc.)
- Writes unit + integration tests for all endpoints
- Runs tests and fixes any failures

### Phase 5 — Review & Verify
- Invokes code-reviewer agent
- Runs security scan (checks for hardcoded secrets, SQL injection, XSS)
- Runs linter if configured

### Phase 6 — Ship
- Final build verification
- All tests pass
- Creates PR or merges to target branch
- Reports completion with full summary

## Parallel Execution Example

For independent work, phases run concurrently:

```
Phase 1: Plan & Design → blocks Phase 2, 3
Phase 2: Implement Auth ─┐→ both run in parallel → block Phase 4
Phase 3: Implement API  ─┘
Phase 4: Write Tests → blocks Phase 5
Phase 5: Review & Ship
```

## Session Plan

Autopilot writes `.local/session_plan.md` as a checkpoint file. If the session is interrupted, it resumes from the last incomplete phase — never from the beginning.
