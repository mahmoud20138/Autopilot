# Changelog

## 1.2.0 (2026-06-11)

### Features
- **Merged v1.0.0 depth with v1.1.0 improvements** — restored full 10-step pipeline (Memory Check → Discovery → Analysis → Phase Detection → Skill Mapping → Session Plan → Execution → Monitoring → Verification → Completion) while keeping v1.1.0's multi-CLI discovery, MCP scanning, and prompt generation
- **Step 0 — Memory Check** now reads `.agents/memory/MEMORY.md` before any work and applies past decisions
- **MCP-aware discovery** — scans for Codegraph, Context7, and Playwright MCP servers with usage guidance for each
- **Codegraph integration** — uses `codegraph_search`, `codegraph_context`, `codegraph_callers/callees`, `codegraph_impact`, and `codegraph_explore` before writing/editing code
- **Hybrid prompt generation** — 6 phase templates (Planning, Implementation, Testing, Review, Debug, Ship) with LLM customization and fallback
- **Enhanced error recovery** — Root Cause Analysis, Incremental Rollback, Graceful Degradation patterns, and error type classification (config/dependency/logic/environment)
- **Expanded monitoring table** — added Rust (`cargo check`/`cargo build`) and Go (`go vet`/`go build`) alongside Node/TS and Python
- **Parallel execution guidance** — clear rules for when to parallelize and when not to, using `Agent` tool with `run_in_background: true`
- **Context budget rule** — never read more than 10 files per turn; use Codegraph or `Explore` subagent for broad analysis
- **Session plan checkpoint** — `.local/session_plan.md` as single source of truth with resume-from-checkpoint support
- **Output manifest** — tracks all artifacts and files produced across phases
- **Follow-up tasks** — proposes up to 3 high-impact follow-ups before completion report
- **Approval gates** — pauses for destructive actions (schema drops, bulk deletes, major library swaps)
- **Expanded Hard Rules** — added "never hardcode skill names" and "never hardcode ports"

### Improvements
- SKILL.md rewritten for clarity — each step has concrete commands, tables, and examples
- Discovery now includes env var scanning (keys only, not values)
- Skill mapping includes MCP tools and CLI tools alongside skills
- Session plan includes MCP and CLI tool fields per task
- Completion report includes Tests and Security verification lines
- Description updated to mention all 5 supported CLIs

## 1.1.0 (2026-05-27)

### Features
- `--version` flag to show current installed version
- `--list` flag to show installed skills across all CLIs
- Support for GitHub Copilot CLI skills directory
- Support for Cursor editor skills directory
- Support for Kilo skills directory
- Restored Launch Tracker, Live Event Streaming, and Stop Tracker sections in SKILL.md
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
