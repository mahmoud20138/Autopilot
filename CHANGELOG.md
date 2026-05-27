# Changelog

## 1.1.0 (2026-05-27)

### Features
- `--version` flag to show current installed version
- `--list` flag to show installed skills across all CLIs
- Support for GitHub Copilot CLI skills directory
- Support for Cursor editor skills directory
- Support for Kilo skills directory
- Parallel execution guidance in SKILL.md
- Progress reporting patterns in SKILL.md
- Enhanced error recovery decision tree in SKILL.md

### Bug Fixes
- Fixed `versionData.cli` field computing wrong value (returned username instead of CLI name)
- Added `execSync` timeout (5s) to all CLI detection calls to prevent hanging
- Fixed Cursor detection to use correct Windows path (`AppData\Local` instead of `AppData\Roaming`)
- Platform-aware Cursor detection (`where` on Windows, `which` on Linux/macOS)
- Fixed `removeSkill` to handle subdirectories using recursive `fs.rmSync`
- Removed dead code (`promptCustomPath` exported but never called)
- Fixed `--update`/`--remove` to include all supported CLI paths (was missing Copilot/Cursor)
- Fixed `--update`/`--remove` to process all installed copies (was breaking after first match)
- Fixed SKILL.md Verification section to use cross-platform file-system probing
- Fixed SKILL.md Monitoring section to avoid `tail` (unavailable on Windows)
- Bumped minimum Node.js engine to 14.14.0 for `fs.rmSync` compatibility
- Removed `__tests__/` from npm published files

### Testing
- Added Jest test suite (20 tests)
- Unit tests for `lib/detector.js`
- Unit tests for `lib/installer.js`
- Tests for all `getSkillsDir` cases including Kilo

### CI/CD
- Added GitHub Actions test workflow (Node 16/18/20)

### Improvements
- Better error messages with actionable suggestions
- Permission error guidance (EACCES)
- Missing directory guidance (ENOENT)
- Parallel CLI detection in install prompt for faster startup

## 1.0.0 (2026-05-25)

- Initial release
- Autonomous orchestrator skill
- Dynamic discovery of skills, MCP servers, CLI tools
- LLM-driven phase detection
- Hybrid prompt generation (templates + customization)
- Poll-based monitoring with retry logic
- Support for OpenClaude and Claude Code
- Install, update, and remove commands
