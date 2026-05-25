# Changelog

## 1.1.0 (2026-05-26)

### Features
- `--version` flag to show current installed version
- `--list` flag to show installed skills across all CLIs
- Support for GitHub Copilot CLI skills directory
- Support for Cursor editor skills directory
- Parallel execution guidance in SKILL.md
- Progress reporting patterns in SKILL.md
- Enhanced error recovery decision tree in SKILL.md

### Testing
- Added Jest test suite (16 tests)
- Unit tests for `lib/detector.js`
- Unit tests for `lib/installer.js`

### CI/CD
- Added GitHub Actions test workflow (Node 16/18/20)

### Improvements
- Better error messages with actionable suggestions
- Permission error guidance (EACCES)
- Missing directory guidance (ENOENT)

## 1.0.0 (2026-05-25)

- Initial release
- Autonomous orchestrator skill
- Dynamic discovery of skills, MCP servers, CLI tools
- LLM-driven phase detection
- Hybrid prompt generation (templates + customization)
- Poll-based monitoring with retry logic
- Support for OpenClaude and Claude Code
- Install, update, and remove commands
