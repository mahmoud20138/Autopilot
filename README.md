# Autopilot Agent Skill

**Fully autonomous AI agent orchestrator** — Give it a goal, it runs everything end-to-end without confirmation.

[![npm version](https://img.shields.io/npm/v/autopilot-agent-skill.svg)](https://www.npmjs.com/package/autopilot-agent-skill)
[![npm downloads](https://img.shields.io/npm/dm/autopilot-agent-skill.svg)](https://www.npmjs.com/package/autopilot-agent-skill)
[![Tests](https://github.com/mahmoud20138/Autopilot/actions/workflows/test.yml/badge.svg)](https://github.com/mahmoud20138/Autopilot/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Works with **Claude Code**, **OpenClaude**, **GitHub Copilot CLI**, **Cursor**, and **Kilo**.

---

## Why Autopilot?

Most AI coding assistants stop and ask "should I continue?" between every step. Autopilot doesn't.

```
You:   /autopilot "build a REST API with JWT auth and tests"
Agent: [discovered 12 skills, 3 MCP servers, 6 CLI tools]
       [6 phases detected → mapped to 4 skills + codegraph + playwright]
       [planning → implementing → testing → reviewing → shipping]
       Done. All tests pass. Ready to merge.
```

**Zero confirmations. Full autonomy. End-to-end execution.**

---

## Quick Start

```bash
# Install the skill
npm i -g autopilot-agent-skill

# Or use npx (no install)
npx autopilot-agent-skill
```

---

## CLI Commands

```bash
npx autopilot-agent-skill           # Install the skill
npx autopilot-agent-skill --update  # Update to latest version
npx autopilot-agent-skill --remove  # Uninstall the skill
npx autopilot-agent-skill --list    # Show installed skills
npx autopilot-agent-skill --version # Show current version
npx autopilot-agent-skill --help    # Show help
```

---

## Supported CLIs

| CLI | Status | Skills Directory |
|-----|--------|-----------------|
| Claude Code | ✓ Supported | `~/.claude/skills/` |
| OpenClaude | ✓ Supported | `~/.openclaude/skills/` |
| GitHub Copilot | ✓ Supported | `~/.config/github-copilot/skills/` |
| Cursor | ✓ Supported | `~/.cursor/skills/` |
| Kilo | ✓ Supported | `~/.config/kilo/skills/` |
| Custom | ✓ Supported | Any path you specify |

---

## How It Works

```
1. Memory Check   → Read MEMORY.md; apply past decisions
2. Discovery      → Scan skills, MCP servers, CLI tools, project context
3. Analysis       → Parse goal, identify type/scope/constraints
4. Phase Detection → Decompose into minimal viable phases
5. Skill Mapping   → Map each phase to best skill + MCP + CLI
6. Session Plan    → Write checkpoint file (.local/session_plan.md)
7. Execution       → Run phases sequentially or in parallel
8. Monitoring      → Typecheck + build + tests after each phase
9. Verification    → Final build, test, lint, security checks
10. Completion     → Clean up, update memory, report
```

---

## Key Features

- **Smart Discovery** — Automatically finds your skills, MCP servers, and CLI tools across 5 CLI platforms
- **Memory-Aware** — Reads past decisions from MEMORY.md before starting
- **Phase Decomposition** — Breaks any goal into minimal viable phases with dependency tracking
- **Dynamic Skill Mapping** — Routes each phase to your best installed skill + MCP tools + CLI tools
- **Prompt Generation** — 6 phase templates (Plan, Implement, Test, Review, Debug, Ship) with customization
- **Parallel Execution** — Runs independent phases concurrently via background agents
- **Self-Healing** — Retries failed phases with adjusted prompts; Root Cause Analysis + Incremental Rollback
- **Context-Aware** — Uses Codegraph MCP for codebase understanding; respects 10-file read limit per turn
- **Checkpoint/Resume** — Session plan enables resume from interruption
- **Final Verification** — Builds, tests, lints, and security scans before reporting done
- **Zero Config** — Works out of the box

---

## Examples

### Simple Task

```
/autopilot "add a health check endpoint to my API"
```

### Bug Fix

```
/autopilot "fix the login timeout error"
```

### Full Project

```
/autopilot "build a user authentication system with JWT, tests, and docs"
```

See `examples/` for detailed walkthroughs.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

---

## License

MIT © [Mahmoud20](https://github.com/mahmoud20138)
