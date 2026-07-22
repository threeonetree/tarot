import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();
const qualityGate = join(projectRoot, '.GATE_QUALITY');
const testGate = join(projectRoot, '.GATE_TEST');

// Read hook input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });

process.stdin.on('end', () => {
  try {
    const hookData = JSON.parse(input);
    const toolName = hookData.tool_name;
    const command = hookData.input?.command || '';

    // Only intercept Bash git commit calls
    if (toolName !== 'Bash' || !/^\s*cd\s+.*&&\s*git\s+commit\b/m.test(command) && !/\bgit\s+commit\b/.test(command)) {
      process.exit(0);
    }

    // Skip hooks that are themselves checking for gates (avoid infinite loop)
    if (command.includes('.GATE_QUALITY') || command.includes('.GATE_TEST')) {
      process.exit(0);
    }

    const qualityExists = existsSync(qualityGate);
    const testExists = existsSync(testGate);

    if (qualityExists && testExists) {
      // Both gates passed - allow commit
      process.exit(0);
    }

    // Gates missing - block commit
    const missing = [];
    if (!qualityExists) missing.push('.GATE_QUALITY');
    if (!testExists) missing.push('.GATE_TEST');

    process.stderr.write(
      `\n❌ 提交被拒绝：缺少质量门禁文件\n` +
      `   缺失：${missing.join(', ')}\n` +
      `   请先运行 /git-commit 完成质检和测试。\n\n`,
    );
    process.exit(1);
  } catch {
    // If we can't parse the input, allow the command
    process.exit(0);
  }
});
