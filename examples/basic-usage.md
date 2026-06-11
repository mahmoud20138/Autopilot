# Basic Usage

## Simple Task

```
/autopilot "add a health check endpoint to my API"
```

The autopilot will:
1. **Discover** your project (Node.js, Express, etc.) + installed skills + MCP servers
2. **Analyze** the goal (single-file feature, simple scope)
3. **Detect phases**: Implement → Test
4. **Map to skills**: feature-dev skill + codegraph for codebase understanding
5. **Execute** and monitor until done
6. **Verify** build + tests pass

## Bug Fix

```
/autopilot "fix the login timeout error"
```

Phases detected:
1. Diagnose → systematic-debugging + codegraph for impact analysis
2. Fix → tdd skill
3. Verify → build + tests pass

## With MCP Tools

When Codegraph MCP is available, autopilot uses it to:
- Find relevant symbols before editing (`codegraph_search`)
- Understand module structure (`codegraph_context`)
- Analyze blast radius before changes (`codegraph_impact`)
- Deep-dive into unfamiliar code (`codegraph_explore`)
