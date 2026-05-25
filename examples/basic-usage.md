# Basic Usage

## Simple Task

```
/autopilot "add a health check endpoint to my API"
```

The autopilot will:
1. Discover your project (Node.js, Express, etc.)
2. Detect phases: Implement → Test
3. Map to skills (subagent-driven-development, tdd)
4. Execute and monitor until done

## Bug Fix

```
/autopilot "fix the login timeout error"
```

Phases detected:
1. Diagnose → systematic-debugging
2. Fix → tdd
3. Verify → verification-before-completion
