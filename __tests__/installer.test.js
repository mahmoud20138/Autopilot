const fs = require('fs');
const path = require('path');
const os = require('os');
const installer = require('../lib/installer');

describe('installer', () => {
  const tmpDir = path.join(os.tmpdir(), 'autopilot-installer-test-' + Date.now());

  beforeEach(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('installSkill', () => {
    test('creates skill directory and copies SKILL.md', () => {
      const result = installer.installSkill(tmpDir);
      expect(fs.existsSync(result)).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, 'autopilot', '.version'))).toBe(true);
    });

    test('creates parent directories if needed', () => {
      const nestedDir = path.join(tmpDir, 'a', 'b', 'c');
      const result = installer.installSkill(nestedDir);
      expect(fs.existsSync(result)).toBe(true);
    });

    test('writes correct version data', () => {
      installer.installSkill(tmpDir);
      const versionFile = path.join(tmpDir, 'autopilot', '.version');
      const data = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
      expect(data).toHaveProperty('installed');
      expect(data).toHaveProperty('date');
      expect(data).toHaveProperty('cli');
      expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(data.cli).toBe(path.basename(path.dirname(tmpDir)));
    });
  });

  describe('updateSkill', () => {
    test('returns not_installed when skill missing', () => {
      const result = installer.updateSkill(tmpDir);
      expect(result.status).toBe('not_installed');
    });

    test('returns up_to_date when versions match', () => {
      installer.installSkill(tmpDir);
      const result = installer.updateSkill(tmpDir);
      expect(result.status).toBe('up_to_date');
    });

    test('returns updated when version differs', () => {
      installer.installSkill(tmpDir);
      const versionFile = path.join(tmpDir, 'autopilot', '.version');
      fs.writeFileSync(versionFile, JSON.stringify({ installed: '0.0.1', date: '2026-01-01' }));
      const result = installer.updateSkill(tmpDir);
      expect(result.status).toBe('updated');
      expect(result.from).toBe('0.0.1');
    });
  });

  describe('removeSkill', () => {
    test('returns not_found when skill missing', () => {
      const result = installer.removeSkill(tmpDir);
      expect(result.status).toBe('not_found');
    });

    test('removes skill directory', () => {
      installer.installSkill(tmpDir);
      const result = installer.removeSkill(tmpDir);
      expect(result.status).toBe('removed');
      expect(fs.existsSync(path.join(tmpDir, 'autopilot'))).toBe(false);
    });

    test('removes skill directory with subdirectories', () => {
      installer.installSkill(tmpDir);
      const subDir = path.join(tmpDir, 'autopilot', 'subdir');
      fs.mkdirSync(subDir, { recursive: true });
      fs.writeFileSync(path.join(subDir, 'file.md'), 'test');
      const result = installer.removeSkill(tmpDir);
      expect(result.status).toBe('removed');
      expect(fs.existsSync(path.join(tmpDir, 'autopilot'))).toBe(false);
    });
  });
});
