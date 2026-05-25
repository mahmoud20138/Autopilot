#!/usr/bin/env node

const chalk = require('chalk');
const detector = require('../lib/detector');
const installer = require('../lib/installer');
const prompts = require('../lib/prompts');

const args = process.argv.slice(2);
const isUpdate = args.includes('--update');
const isRemove = args.includes('--remove');
const isHelp = args.includes('--help') || args.includes('-h');

// Show help
if (isHelp) {
  console.log(`
${chalk.bold('autopilot-agent-skill')}

Autonomous orchestrator skill for OpenClaude and Claude Code.

${chalk.bold('Usage:')}
  npx autopilot-agent-skill           Install the skill
  npx autopilot-agent-skill --update  Update to latest version
  npx autopilot-agent-skill --remove  Uninstall the skill
  npx autopilot-agent-skill --help    Show this help

${chalk.bold('After install:')}
  Use in your CLI: /autopilot "your goal here"
  `);
  process.exit(0);
}

async function main() {
  console.log(chalk.bold('\n🤖 Autopilot Agent Skill\n'));

  try {
    // Handle --remove
    if (isRemove) {
      const skillPaths = [
        detector.getSkillsDir('claude-code'),
        detector.getSkillsDir('openclaude'),
      ].filter(Boolean);

      let removed = false;
      for (const skillPath of skillPaths) {
        if (detector.isSkillInstalled(skillPath)) {
          const confirmed = await prompts.confirmRemoval();
          if (confirmed) {
            const result = installer.removeSkill(skillPath);
            if (result.status === 'removed') {
              console.log(chalk.green(`\n✓ Removed autopilot skill from ${skillPath}`));
              removed = true;
            }
          } else {
            console.log(chalk.yellow('\nCancelled.'));
          }
          break;
        }
      }

      if (!removed) {
        console.log(chalk.yellow('\nAutopilot skill not found.'));
      }
      return;
    }

    // Handle --update
    if (isUpdate) {
      const skillPaths = [
        detector.getSkillsDir('claude-code'),
        detector.getSkillsDir('openclaude'),
      ].filter(Boolean);

      let updated = false;
      for (const skillPath of skillPaths) {
        if (detector.isSkillInstalled(skillPath)) {
          const result = installer.updateSkill(skillPath);
          if (result.status === 'up_to_date') {
            console.log(chalk.green(`\n✓ Already up to date (v${result.version})`));
          } else if (result.status === 'updated') {
            console.log(chalk.green(`\n✓ Updated from v${result.from} to v${result.to}`));
            console.log(chalk.gray(`  Location: ${result.path}`));
          } else {
            console.log(chalk.yellow('\nNot installed. Run without --update to install.'));
          }
          updated = true;
          break;
        }
      }

      if (!updated) {
        console.log(chalk.yellow('\nAutopilot skill not found. Run without --update to install.'));
      }
      return;
    }

    // Default: Install
    const targetDir = await prompts.promptCLI();

    if (!targetDir) {
      console.log(chalk.red('\n✗ Could not determine skills directory.'));
      process.exit(1);
    }

    // Check if already installed
    if (detector.isSkillInstalled(targetDir)) {
      const installed = detector.getInstalledVersion(targetDir);
      console.log(chalk.yellow(`\n⚠ Already installed (v${installed?.installed || 'unknown'})`));
      console.log(chalk.gray('  Use --update to update or --remove to uninstall.'));
      return;
    }

    // Install
    const skillPath = installer.installSkill(targetDir);

    console.log(chalk.green('\n✓ Installed autopilot skill!'));
    console.log(chalk.gray(`  Location: ${skillPath}`));
    console.log(chalk.gray('\n  Usage: /autopilot "your goal here"\n'));

  } catch (error) {
    console.error(chalk.red(`\n✗ Error: ${error.message}`));
    process.exit(1);
  }
}

main();
