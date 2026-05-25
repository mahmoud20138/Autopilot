const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

/**
 * Detect if OpenClaude CLI is installed
 */
function isOpenClaudeInstalled() {
  try {
    execSync('openclaude --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect if Claude Code CLI is installed
 */
function isClaudeCodeInstalled() {
  try {
    execSync('claude --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect if Copilot CLI is installed
 */
function isCopilotInstalled() {
  try {
    execSync('gh copilot --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect if Cursor editor is installed
 */
function isCursorInstalled() {
  const home = os.homedir();
  const cursorPaths = [
    path.join(home, '.cursor'),
    path.join(home, 'AppData', 'Roaming', 'Cursor'),
  ];
  return cursorPaths.some(p => fs.existsSync(p));
}

/**
 * Get skills directory based on CLI choice
 */
function getSkillsDir(cliChoice) {
  const home = os.homedir();
  switch (cliChoice) {
    case 'claude-code':
      return path.join(home, '.claude', 'skills');
    case 'openclaude':
      return path.join(home, '.openclaude', 'skills');
    case 'copilot':
      return path.join(home, '.config', 'github-copilot', 'skills');
    case 'cursor':
      return path.join(home, '.cursor', 'skills');
    default:
      return null;
  }
}

/**
 * Check if skill is already installed
 */
function isSkillInstalled(installPath) {
  const skillPath = path.join(installPath, 'autopilot', 'SKILL.md');
  return fs.existsSync(skillPath);
}

/**
 * Get installed version info
 */
function getInstalledVersion(installPath) {
  const versionFile = path.join(installPath, 'autopilot', '.version');
  if (!fs.existsSync(versionFile)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(versionFile, 'utf8'));
  } catch {
    return null;
  }
}

module.exports = {
  isOpenClaudeInstalled,
  isClaudeCodeInstalled,
  isCopilotInstalled,
  isCursorInstalled,
  getSkillsDir,
  isSkillInstalled,
  getInstalledVersion,
};
