const fs = require('fs');
const path = require('path');
const { getInstalledVersion } = require('./detector');

/**
 * Install skill to target directory
 */
function installSkill(targetDir) {
  const skillDir = path.join(targetDir, 'autopilot');
  const sourceSkill = path.join(__dirname, '..', 'skills', 'autopilot', 'SKILL.md');

  // Create directory if needed
  if (!fs.existsSync(skillDir)) {
    fs.mkdirSync(skillDir, { recursive: true });
  }

  // Copy SKILL.md
  const targetSkill = path.join(skillDir, 'SKILL.md');
  fs.copyFileSync(sourceSkill, targetSkill);

  // Write version file
  const packageJson = require('../package.json');
  const versionFile = path.join(skillDir, '.version');
  const versionData = {
    installed: packageJson.version,
    date: new Date().toISOString().split('T')[0],
    cli: path.basename(path.dirname(path.dirname(targetDir))),
  };
  fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

  return targetSkill;
}

/**
 * Update skill if newer version available
 */
function updateSkill(targetDir) {
  const installed = getInstalledVersion(targetDir);
  const packageJson = require('../package.json');

  if (!installed) {
    return { status: 'not_installed' };
  }

  if (installed.installed === packageJson.version) {
    return { status: 'up_to_date', version: installed.installed };
  }

  // Update by reinstalling
  const skillPath = installSkill(targetDir);
  return {
    status: 'updated',
    from: installed.installed,
    to: packageJson.version,
    path: skillPath,
  };
}

/**
 * Remove skill from target directory
 */
function removeSkill(targetDir) {
  const skillDir = path.join(targetDir, 'autopilot');
  if (!fs.existsSync(skillDir)) {
    return { status: 'not_found' };
  }

  // Remove all files in the directory
  const files = fs.readdirSync(skillDir);
  for (const file of files) {
    fs.unlinkSync(path.join(skillDir, file));
  }
  fs.rmdirSync(skillDir);

  return { status: 'removed' };
}

module.exports = {
  installSkill,
  updateSkill,
  removeSkill,
};
