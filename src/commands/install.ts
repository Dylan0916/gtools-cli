import fs from 'fs';
import path from 'path';

function getSkillsSourceDir(): string {
  // skills/ directory is at the root of the gtools-cli package
  return path.resolve(import.meta.dirname, '..', '..', 'skills');
}

function discoverSkills(skillsDir: string): string[] {
  if (!fs.existsSync(skillsDir)) {
    return [];
  }
  return fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

function promptChoice(question: string, options: string[]): string | null {
  const lines = options.map((opt, i) => `  ${i + 1}) ${opt}`).join('\n');
  const input = prompt(`${question}\n${lines}\n>`);

  if (input === null) {
    return null;
  }

  const index = Number(input.trim()) - 1;
  if (index >= 0 && index < options.length) {
    return options[index];
  }

  return null;
}

export async function runInstallSkills(): Promise<void> {
  const skillsSourceDir = getSkillsSourceDir();

  const skillNames = discoverSkills(skillsSourceDir);

  if (skillNames.length === 0) {
    console.error('❌ No skills found in:', skillsSourceDir);
    process.exit(1);
  }

  // Step 1: Ask install scope
  const scopeChoice = promptChoice('Install skills to:', [
    `Current project (${process.cwd()})`,
    `Global (~/)`,
  ]);

  if (scopeChoice === null) {
    console.log('Cancelled.');
    return;
  }

  const baseDir = scopeChoice.startsWith('Global')
    ? process.env.HOME ?? process.env.USERPROFILE ?? '~'
    : process.cwd();

  // Step 2: Ask target directory
  const targetChoice = promptChoice('Target directory:', [
    '.claude/skills',
    '.agents/skills',
    'Other (enter path)',
  ]);

  if (targetChoice === null) {
    console.log('Cancelled.');
    return;
  }

  let skillsTargetDir: string;

  if (targetChoice === 'Other (enter path)') {
    const customPath = prompt('Enter path (relative to base or absolute)\n>');
    if (customPath === null || customPath.trim() === '') {
      console.log('Cancelled.');
      return;
    }
    const trimmed = customPath.trim();
    skillsTargetDir = path.isAbsolute(trimmed)
      ? trimmed
      : path.join(baseDir, trimmed);
  } else {
    skillsTargetDir = path.join(baseDir, targetChoice);
  }

  // Step 3: Copy each skill
  for (const skillName of skillNames) {
    const src = path.join(skillsSourceDir, skillName);
    const dest = path.join(skillsTargetDir, skillName);
    await fs.promises.mkdir(dest, { recursive: true });
    await fs.promises.cp(src, dest, { recursive: true });

    const relPath = path.relative(process.cwd(), dest);
    console.log(`✅ Installed ${skillName} skill to ${relPath}/`);
  }
}
