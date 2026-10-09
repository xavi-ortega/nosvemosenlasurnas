import { execFileSync } from 'node:child_process';
execFileSync('python3', ['outputs/render-development-plan.py', ...(process.argv.includes('--check') ? ['--check'] : [])], { stdio: 'inherit' });
