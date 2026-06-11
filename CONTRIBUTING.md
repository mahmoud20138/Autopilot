# Contributing to Autopilot Agent Skill

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/mahmoud20138/Autopilot.git
cd Autopilot
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:ci
```

## Project Layout

```
bin/install.js              — CLI entry point (install/update/remove/list)
lib/detector.js             — Detects installed CLIs and resolves skill paths
lib/installer.js            — Handles install, update, and remove operations
lib/prompts.js              — Interactive CLI prompts
skills/autopilot/SKILL.md   — The actual skill definition (the orchestrator)
skills/autopilot/.version   — Version metadata
examples/                   — Usage examples (basic-usage.md, full-project.md)
__tests__/                  — Jest test suite
.github/workflows/          — CI/CD (test.yml, publish.yml)
CHANGELOG.md                — Version history
CONTRIBUTING.md             — This file
README.md                   — Package documentation
package.json                — npm package config
LICENSE                     — MIT license
```

## Supported CLIs

| CLI | Skills Directory |
|-----|-----------------|
| Claude Code | `~/.claude/skills/` |
| OpenClaude | `~/.openclaude/skills/` |
| GitHub Copilot | `~/.config/github-copilot/skills/` |
| Cursor | `~/.cursor/skills/` |
| Kilo | `~/.config/kilo/skills/` |

## Making Changes

1. Create a branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Commit with a descriptive message
5. Push and open a PR

## Releasing a New Version

1. Update `package.json` version field
2. Add entry to `CHANGELOG.md`
3. Update `skills/autopilot/.version`
4. Commit and push
5. Create a GitHub release → npm publish runs automatically via GitHub Actions

## Adding New CLI Support

If you want to add support for a new CLI tool:

1. Add detection logic in `lib/detector.js`
2. Add the skills directory path mapping
3. Update `lib/prompts.js` to include the new CLI
4. Update `bin/install.js` for --list output
5. Add tests in `__tests__/detector.test.js`
6. Update the README's supported CLIs table

## Code Style

- Use consistent formatting (match existing code)
- Keep functions focused and small
- Add comments where logic isn't self-evident
- Write tests for new functionality

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
