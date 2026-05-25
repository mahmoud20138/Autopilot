# Autopilot Agent Skill

**Fully autonomous AI agent orchestrator** — Give it a goal, it runs everything end-to-end without confirmation.

[![npm version](https://img.shields.io/npm/v/autopilot-agent-skill.svg)](https://www.npmjs.com/package/autopilot-agent-skill)
[![npm downloads](https://img.shields.io/npm/dm/autopilot-agent-skill.svg)](https://www.npmjs.com/package/autopilot-agent-skill)
[![Tests](https://github.com/mahmoud20138/Autopilot/actions/workflows/test.yml/badge.svg)](https://github.com/mahmoud20138/Autopilot/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Works with **Claude Code**, **OpenClaude**, **GitHub Copilot CLI**, and **Cursor**.

---

## Why Autopilot?

Most AI coding assistants stop and ask "should I continue?" between every step. Autopilot doesn't.

```
You:   /autopilot "build a REST API with JWT auth and tests"
Agent: [discovered 12 skills, 3 MCP servers, 6 CLI tools]
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
| Custom | ✓ Supported | Any path you specify |

---

## How It Works

```
1. Discovery     → Scan for skills, MCP servers, CLI tools
2. Analysis      → Understand your goal
3. Phases        → Break goal into logical phases
4. Skills        → Map each phase to your best installed skill
5. Execution     → Run phases autonomously
6. Monitoring    → Check progress, retry failures
7. Verification  → Build, test, lint before reporting done
```

---

## Key Features

- **Smart Discovery** — Automatically finds your skills, MCP servers, and CLI tools
- **Phase Decomposition** — Breaks any goal into logical phases
- **Dynamic Skill Mapping** — Routes each phase to your best installed skill
- **Parallel Execution** — Runs independent phases concurrently
- **Self-Healing** — Retries failed phases with adjusted prompts
- **Final Verification** — Builds, tests, and lints before reporting done
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
