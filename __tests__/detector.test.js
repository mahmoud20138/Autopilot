const fs = require('fs');
const path = require('path');
const os = require('os');
const detector = require('../lib/detector');

describe('detector', () => {
  describe('getSkillsDir', () => {
    test('returns claude-code skills dir', () => {
      const result = detector.getSkillsDir('claude-code');
      expect(result).toBe(path.join(os.homedir(), '.claude', 'skills'));
    });

    test('returns openclaude skills dir', () => {
      const result = detector.getSkillsDir('openclaude');
      expect(result).toBe(path.join(os.homedir(), '.openclaude', 'skills'));
    });

    test('returns null for unknown CLI', () => {
      const result = detector.getSkillsDir('unknown');
      expect(result).toBeNull();
    });
  });

  describe('isSkillInstalled', () => {
    const tmpDir = path.join(os.tmpdir(), 'autopilot-test-' + Date.now());

    afterAll(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('returns false when skill not installed', () => {
      expect(detector.isSkillInstalled(tmpDir)).toBe(false);
    });

    test('returns true when skill is installed', () => {
      const skillDir = path.join(tmpDir, 'autopilot');
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), 'test');
      expect(detector.isSkillInstalled(tmpDir)).toBe(true);
    });
  });

  describe('getInstalledVersion', () => {
    const tmpDir = path.join(os.tmpdir(), 'autopilot-version-test-' + Date.now());

    afterAll(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('returns null when no version file exists', () => {
      expect(detector.getInstalledVersion(tmpDir)).toBeNull();
    });

    test('returns version data when file exists', () => {
      const skillDir = path.join(tmpDir, 'autopilot');
      fs.mkdirSync(skillDir, { recursive: true });
      const versionData = { installed: '1.0.0', date: '2026-05-25' };
      fs.writeFileSync(path.join(skillDir, '.version'), JSON.stringify(versionData));
      expect(detector.getInstalledVersion(tmpDir)).toEqual(versionData);
    });

    test('returns null for invalid JSON', () => {
      const skillDir = path.join(tmpDir, 'autopilot');
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, '.version'), 'not json');
      expect(detector.getInstalledVersion(tmpDir)).toBeNull();
    });
  });
});
