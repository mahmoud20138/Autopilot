const inquirer = require('inquirer');
const chalk = require('chalk');
const detector = require('./detector');

/**
 * Prompt user to select CLI
 */
async function promptCLI() {
  const openclaude = detector.isOpenClaudeInstalled();
  const claudeCode = detector.isClaudeCodeInstalled();

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

  choices.push({
    name: 'Custom path',
    value: 'custom',
  });

  // Default to Claude Code if available, otherwise first option
  const defaultChoice = claudeCode ? 'claude-code' : choices[0].value;

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
 * Prompt for custom path
 */
async function promptCustomPath() {
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
  promptCustomPath,
  confirmRemoval,
};
