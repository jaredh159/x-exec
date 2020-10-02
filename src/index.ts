import { execSync } from 'child_process';

export interface ErrData {
  exitCode: number;
  message: string;
  stdErr: string;
  stdOut: string;
}

export default function exec(cmd: string, cwd?: string): [null | ErrData, string] {
  try {
    return [null, execSync(cmd, { stdio: `pipe`, ...(cwd ? { cwd } : {}) }).toString()];
  } catch (err) {
    return [
      {
        exitCode: typeof err.status === `number` ? err.status : 1,
        message: String(err.message),
        stdErr: err.stderr.toString(),
        stdOut: err.stdout.toString(),
      },
      String(err.message),
    ];
  }
}

exec.exit = function (cmd: string, cwd?: string): string {
  const [err, msg] = exec(cmd, cwd);
  if (!err) {
    return msg;
  }

  console.error(`\x1b[31mEXEC CMD ERROR: \`${cmd}\`\n\n${err.message}\x1b[0m`);
  process.exit(1);
};

exec.success = function (cmd: string, cwd?: string): boolean {
  const [err] = exec(cmd, cwd);
  return !err;
};
