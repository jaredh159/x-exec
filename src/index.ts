import { execSync, spawnSync } from 'child_process';

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

/**
 *
 * Synchronously exec a command, sending all stdout/stderr
 * straight through to the current process's stdout/stderr.
 * Return a boolean representing the process exit code.
 */
exec.out = function (cmd: string, cwd?: string): boolean {
  const parts = cmd.split(/ +/g);
  const { status } = spawnSync(parts.shift(), parts, {
    stdio: `inherit`,
    ...(cwd ? { cwd } : {}),
  });
  return status === 0;
};

/**
 * Run a command, returning the stdout as a string.
 * If the command was unsuccessful (exit=1)
 * log the error and immediately exit 1
 */
exec.exit = function (cmd: string, cwd?: string): string {
  const [err, msg] = exec(cmd, cwd);
  if (!err) {
    return msg;
  }

  console.error(`\x1b[31mEXEC CMD ERROR: \`${cmd}\`\n\n${err.message}\x1b[0m`);
  process.exit(1);
};

/**
 * Run a command, swallowing all output, only returning
 * a single boolean representing the exit status of the command.
 */
exec.success = function (cmd: string, cwd?: string): boolean {
  const [err] = exec(cmd, cwd);
  return !err;
};
