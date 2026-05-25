# autopilot-agent-skill

> **Fully autonomous AI agent orchestrator** — Give it a goal, and it runs everything end-to-end without asking for confirmation between steps.

[![npm version](https://img.shields.io/npm/v/autopilot-agent-skill.svg)](https://www.npmjs.com/package/autopilot-agent-skill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What Is This?

**Autopilot Agent Skill** is an autonomous orchestrator that works with **Claude Code** and **OpenClaude**. You give it a single goal, and it:

1. **Discovers** what tools, skills, and plugins you have installed
2. **Analyzes** your goal and breaks it into logical phases
3. **Maps** each phase to the best available skill on your system
4. **Executes** each phase automatically, one after another
5. **Monitors** progress and retries if something fails
6. **Verifies** everything is done (builds, tests, lint) before reporting completion

**You never confirm between steps.** It runs until the project is done or hits a blocker it can't resolve.

---

## Install

```bash
npm i autopilot-agent-skill
```

Or use npx (no global install needed):

```bash
npx autopilot-agent-skill
```

The installer will detect which CLI you're using and install the skill to the correct directory.

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

## Usage

After installation, use the skill in your CLI:

```
/autopilot "build a REST API with JWT authentication and tests"
```

### Example Goals

**Simple task:**
```
/autopilot "add a health check endpoint to my API"
```

**Bug fix:**
```
/autopilot "fix the login timeout error"
```

**Full project:**
```
/autopilot "build a user authentication system with JWT, tests, and documentation"
```

**Refactor:**
```
/autopilot "refactor the database layer to use repositories"
```

---

## How It Works — Step by Step

```
┌─────────────────────────────────────────────────────────────┐
│                     AUTOPILOT PIPELINE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. INPUT                                                   │
│     You type: /autopilot "your goal"                        │
│                                                             │
│  2. DISCOVERY                                               │
│     Scans your system for:                                  │
│     • Installed skills (from skills directory)              │
│     • MCP servers (codegraph, playwright, context7, etc.)   │
│     • CLI tools (git, npm, python, pytest, etc.)            │
│     • Project context (language, framework, test setup)     │
│                                                             │
│  3. ANALYSIS                                                │
│     Understands your goal:                                  │
│     • What type of task (feature, bug, refactor, project)   │
│     • How big is the scope                                  │
│     • What constraints exist                                │
│                                                             │
│  4. PHASE DETECTION                                         │
│     Breaks the goal into logical phases:                    │
│     Phase 1: Plan & Design                                  │
│     Phase 2: Implement                                      │
│     Phase 3: Test                                           │
│     Phase 4: Review                                         │
│     Phase 5: Ship                                           │
│                                                             │
│  5. SKILL MAPPING                                           │
│     Matches each phase to your installed skills:            │
│     • Planning → writing-plans, brainstorming               │
│     • Implementation → subagent-driven-development          │
│     • Testing → tdd, test-driven-development                │
│     • Review → requesting-code-review                       │
│     • Shipping → finishing-a-development-branch             │
│     (No skills? Falls back to direct LLM reasoning)         │
│                                                             │
│  6. PROMPT GENERATION                                       │
│     Creates a tailored prompt for each phase:               │
│     • Uses base templates for common phase types            │
│     • Adds project-specific context                         │
│     • Includes outputs from previous phases                 │
│                                                             │
│  7. EXECUTION                                               │
│     Runs each phase automatically:                          │
│     • Invokes the mapped skill with the prompt              │
│     • Commits work frequently                               │
│     • Moves to next phase without asking                    │
│                                                             │
│  8. MONITORING                                              │
│     Polls progress during execution:                        │
│     • Checks task list status                               │
│     • Checks git status                                     │
│     • Runs tests if available                               │
│     • Runs builds if available                              │
│     • Retries failed phases (max 2 retries)                 │
│                                                             │
│  9. COMPLETION                                              │
│     Final verification before reporting done:               │
│     • Build check                                           │
│     • Test check                                            │
│     • Lint check                                            │
│     • Git status                                            │
│     • Reports: "All done! Project goal achieved."           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## What Skills Does It Use?

The autopilot **dynamically discovers** whatever skills you have installed. It does NOT assume any specific skills exist.

**Common skill mappings:**

| Phase | Skill (if installed) | Fallback |
|-------|---------------------|----------|
| Plan & Design | `writing-plans`, `brainstorming` | LLM generates plan directly |
| Implement | `subagent-driven-development`, `executing-plans` | LLM implements directly |
| Test | `tdd`, `test-driven-development` | LLM writes tests directly |
| Debug | `systematic-debugging`, `diagnose` | LLM debugs directly |
| Review | `requesting-code-review`, `code-review` | LLM reviews directly |
| Verify | `verification-before-completion` | LLM verifies directly |
| Ship | `finishing-a-development-branch` | LLM ships directly |

**If you have zero skills installed**, it still works — the agent handles everything using its own reasoning.

---

## MCP Server Support

The autopilot detects and uses MCP servers you have configured:

| MCP Server | Used For |
|------------|----------|
| **CodeGraph** | Understanding codebase structure, finding symbols |
| **Playwright** | Testing web UIs |
| **Context7** | Fetching up-to-date documentation |

---

## Failure Handling

If a phase fails:

1. Analyzes the failure reason
2. Adjusts the prompt with more context
3. Retries the same skill (max 2 retries)
4. If still failing, tries an alternative skill
5. If no alternative works, skips the phase (if non-critical) or reports a blocker

**The agent never gives up without trying alternatives.**

---

## Stop Conditions

**The agent stops only when:**
- All phases completed successfully
- Final verification passes (build, tests, lint)
- Project goal is achieved

**The agent never stops for:**
- "Should I continue?" prompts
- Progress summaries
- Confirmation between phases

**The agent pauses only if:**
- A hard blocker that no skill can resolve
- Missing external dependency
- Ambiguous requirement that has multiple valid interpretations

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
│       └── SKILL.md        # The actual skill (646 lines)
├── examples/
│   ├── basic-usage.md      # Simple task examples
│   └── full-project.md     # Full project examples
├── .github/
│   └── workflows/
│       └── publish.yml     # Auto-publish to npm on release
├── package.json
├── README.md
└── CHANGELOG.md
```

---

## For Developers

### Local Development

```bash
git clone https://github.com/mahmoud20138/Autopilot.git
cd Autopilot
npm install
node bin/install.js --help
```

### Publishing

```bash
npm login
npm publish
```

GitHub Actions will auto-publish when you create a release.

---

## Changelog

### 1.0.0 (2026-05-25)

- Initial release
- Autonomous orchestrator skill
- Dynamic discovery of skills, MCP servers, CLI tools
- LLM-driven phase detection
- Hybrid prompt generation (templates + customization)
- Poll-based monitoring with retry logic
- Support for Claude Code and OpenClaude
- Install, update, and remove commands

---

## Links

- **GitHub**: [github.com/mahmoud20138/Autopilot](https://github.com/mahmoud20138/Autopilot)
- **npm**: [npmjs.com/package/autopilot-agent-skill](https://www.npmjs.com/package/autopilot-agent-skill)

---

## License

MIT
