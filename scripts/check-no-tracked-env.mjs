import { execFileSync } from 'node:child_process';

const output = execFileSync('git', ['ls-files'], { encoding: 'utf8' });
const files = output.split(/\r?\n/).filter(Boolean);

const violations = files.filter((file) => {
  const normalized = file.replace(/\\/g, '/');
  const isEnv = /(^|\/)\.env($|\.)/.test(normalized);
  const isAllowedExample = /(^|\/)\.env\.example(\.txt)?$/.test(normalized);
  return isEnv && !isAllowedExample;
});

if (violations.length > 0) {
  console.error('Tracked .env files are not allowed:');
  for (const v of violations) console.error(v);
  process.exit(1);
}

console.log('No tracked .env files found.');