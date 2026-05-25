# Autopilot Agent Skill

**Fully autonomous AI agent orchestrator** — Give it a goal, it runs everything end-to-end without confirmation.

[![npm version](https://img.shields.io/npm/v/autopilot-agent-skill.svg)](https://www.npmjs.com/package/autopilot-agent-skill)
[![npm downloads](https://img.shields.io/npm/dm/autopilot-agent-skill.svg)](https://www.npmjs.com/package/autopilot-agent-skill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/mahmoud20138/Autopilot)](https://github.com/mahmoud20138/Autopilot/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/mahmoud20138/Autopilot)](https://github.com/mahmoud20138/Autopilot/issues)

> Works with **Claude Code** and **OpenClaude**. Install once, use everywhere.

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

## Key Features

- **Smart Discovery** — Automatically finds your skills, MCP servers, and CLI tools
- **Phase Decomposition** — Breaks any goal into logical phases (plan, implement, test, review, ship)
- **Dynamic Skill Mapping** — Routes each phase to your best installed skill, with LLM fallback
- **Self-Healing** — Retries failed phases with adjusted prompts, tries alternative skills
- **Final Verification** — Builds, tests, and lints before reporting done
- **Zero Config** — Works out of the box with whatever you have installed

---

## Quick Start

```bash
# Install the skill
npm i -g autopilot-agent-skill

# Or use npx (no install)
npx autopilot-agent-skill
```

Then in your CLI:

```
/autopilot "your goal here"
```

---

## Supported CLIs

| CLI | Skills Directory | Status |
|-----|------------------|--------|
| **Claude Code** | `~/.claude/skills/` | Default |
| **OpenClaude** | `~/.openclaude/skills/` | Supported |

---

## Commands

```bash
npx autopilot-agent-skill           # Install the skill
npx autopilot-agent-skill --update  # Update to latest version
npx autopilot-agent-skill --remove  # Uninstall the skill
npx autopilot-agent-skill --help    # Show help
```

---

## Usage Examples

```
/autopilot "add a health check endpoint to my API"
/autopilot "fix the login timeout error"
/autopilot "build a user authentication system with JWT, tests, and docs"
/autopilot "refactor the database layer to use repositories"
/autopilot "set up CI/CD with GitHub Actions"
```

---

## How It Works

```
Input → Discovery → Analysis → Phase Detection → Skill Mapping → Prompt Generation → Execution → Monitor → Done
```

| Step | What Happens |
|------|-------------|
| **1. Discovery** | Scans for installed skills, MCP servers, CLI tools, project context |
| **2. Analysis** | Parses your goal — identifies task type, scope, constraints |
| **3. Phase Detection** | Decomposes into logical phases (plan, build, test, review, ship) |
| **4. Skill Mapping** | Matches each phase to the best available skill on your system |
| **5. Execution** | Runs each phase sequentially with auto-generated prompts |
| **6. Monitoring** | Polls task status, git, tests, builds — retries on failure |
| **7. Verification** | Final build/test/lint check before reporting done |

### Skill Mapping

The autopilot **dynamically discovers** whatever you have installed — it does NOT assume any specific skills exist.

| Phase | Skill (if installed) | Fallback |
|-------|---------------------|----------|
| Plan & Design | `writing-plans`, `brainstorming` | LLM generates plan directly |
| Implement | `subagent-driven-development`, `executing-plans` | LLM implements directly |
| Test | `tdd`, `test-driven-development` | LLM writes tests directly |
| Debug | `systematic-debugging`, `diagnose` | LLM debugs directly |
| Review | `requesting-code-review`, `code-review` | LLM reviews directly |
| Verify | `verification-before-completion` | LLM verifies directly |
| Ship | `finishing-a-development-branch` | LLM ships directly |

**Zero skills installed? Still works.** The agent handles everything with its own reasoning.

---

## MCP Server Support

Automatically detects and uses configured MCP servers:

| MCP Server | Used For |
|------------|----------|
| **CodeGraph** | Codebase structure, symbol lookup, impact analysis |
| **Playwright** | Web UI testing |
| **Context7** | Up-to-date library documentation |

---

## Failure Handling

If a phase fails, Autopilot:

1. Analyzes the failure reason
2. Adjusts the prompt with more context
3. Retries (max 2 attempts)
4. Tries an alternative skill
5. Skips (if non-critical) or reports a blocker

**It never gives up without trying alternatives.**

---

## Project Structure

```
autopilot-agent-skill/
├── bin/
│   └── install.js          # CLI entry point
├── lib/
│   ├── detector.js         # CLI detection & path resolution
│   ├── installer.js        # Install/update/remove operations
│   └── prompts.js          # Interactive prompts
├── skills/
│   └── autopilot/
│       └── SKILL.md        # The actual skill
├── examples/
│   ├── basic-usage.md      # Simple task examples
│   └── full-project.md     # Full project examples
├── .github/
│   └── workflows/
│       └── publish.yml     # Auto-publish to npm on release
├── LICENSE
├── CHANGELOG.md
└── README.md
```

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Links

- **npm**: [npmjs.com/package/autopilot-agent-skill](https://www.npmjs.com/package/autopilot-agent-skill)
- **GitHub**: [github.com/mahmoud20138/Autopilot](https://github.com/mahmoud20138/Autopilot)
- **Issues**: [Report a bug or request a feature](https://github.com/mahmoud20138/Autopilot/issues)

---

## License

[MIT](LICENSE) — Copyright (c) 2026 Mahmoud20
