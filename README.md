# autopilot-agent-skill

Autonomous orchestrator skill for OpenClaude and Claude Code.
Takes a goal, discovers available tools, decomposes into phases,
maps to skills, executes, and monitors until done.

## Install

```bash
npx autopilot-agent-skill
```

## Usage

After install, use in your CLI:

```
/autopilot "build a REST API with auth and tests"
```

## How It Works

1. Discovers your installed skills, MCP servers, CLI tools
2. Analyzes your goal and decomposes into phases
3. Maps each phase to the best available skill
4. Executes phases sequentially with monitoring
5. Verifies completion (build, tests, lint)

## Commands

```bash
npx autopilot-agent-skill           # Install
npx autopilot-agent-skill --update  # Update to latest
npx autopilot-agent-skill --remove  # Uninstall
npx autopilot-agent-skill --help    # Show help
```

## Supported CLIs

- **Claude Code** (`~/.claude/skills/`) — Default
- **OpenClaude** (`~/.openclaude/skills/`)

## Examples

See [examples/](examples/) directory for:
- [basic-usage.md](examples/basic-usage.md) — Simple task workflow
- [full-project.md](examples/full-project.md) — End-to-end project build

## GitHub

[github.com/mahmoud20138/Autopilot](https://github.com/mahmoud20138/Autopilot)

## License

MIT
