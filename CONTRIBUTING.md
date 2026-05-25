# Contributing to Autopilot Agent Skill

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/mahmoud20138/Autopilot.git
cd Autopilot
npm install
node bin/install.js --help
```

## Project Layout

- `bin/install.js` — CLI entry point
- `lib/detector.js` — Detects installed CLIs and resolves paths
- `lib/installer.js` — Handles install, update, and remove operations
- `lib/prompts.js` — Interactive CLI prompts
- `skills/autopilot/SKILL.md` — The actual skill definition

## Making Changes

1. Create a branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test locally: `node bin/install.js --help`
4. Commit with a descriptive message
5. Push and open a PR

## Adding New CLI Support

If you want to add support for a new CLI tool:

1. Add detection logic in `lib/detector.js`
2. Add the skills directory path mapping
3. Test the installer with the new CLI
4. Update the README's supported CLIs table

## Reporting Issues

Use the GitHub issue templates:

- **Bug Report** — Something is broken
- **Feature Request** — Something is missing
- **Question** — Need help or clarification

## Code Style

- Use consistent formatting (match existing code)
- Keep functions focused and small
- Add comments where logic isn't self-evident

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
