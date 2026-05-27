const inquirer = require('inquirer');
const chalk = require('chalk');
const detector = require('./detector');

/**
 * Prompt user to select CLI
 */
async function promptCLI() {
  const openclaude = detector.isOpenClaudeInstalled();
  const claudeCode = detector.isClaudeCodeInstalled();
  const copilot = detector.isCopilotInstalled();
  const cursor = detector.isCursorInstalled();
  const kilo = detector.isKiloInstalled();

  const choices = [];

  if (claudeCode) {
    choices.push({
      name: `Claude Code (${chalk.green('detected')})`,
      value: 'claude-code',
    });
  }

  if (openclaude) {
    choices.push({
      name: `OpenClaude (${chalk.green('detected')})`,
      value: 'openclaude',
    });
  }

  if (copilot) {
    choices.push({
      name: `GitHub Copilot CLI (${chalk.green('detected')})`,
      value: 'copilot',
    });
  }

  if (cursor) {
    choices.push({
      name: `Cursor (${chalk.green('detected')})`,
      value: 'cursor',
    });
  }

  if (kilo) {
    choices.push({
      name: `Kilo (${chalk.green('detected')})`,
      value: 'kilo',
    });
  }

  choices.push({
    name: 'Custom path',
    value: 'custom',
  });

  const defaultChoice = claudeCode ? 'claude-code' : choices[0]?.value || 'custom';

  const { cli } = await inquirer.prompt([
    {
      type: 'list',
      name: 'cli',
      message: 'Which CLI are you using?',
      choices,
      default: defaultChoice,
    },
  ]);

  if (cli === 'custom') {
    const { customPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customPath',
        message: 'Enter the skills directory path:',
        validate: (input) => {
          if (!input.trim()) return 'Path cannot be empty';
          return true;
        },
      },
    ]);
    return customPath;
  }

  return detector.getSkillsDir(cli);
}

/**
 * Confirm removal
 */
async function confirmRemoval() {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Remove autopilot skill?',
      default: false,
    },
  ]);
  return confirm;
}

module.exports = {
  promptCLI,
  confirmRemoval,
};
