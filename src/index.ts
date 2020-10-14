import { execSync, spawnSync, exec as coreExec } from 'child_process';

export interface ErrData {
  exitCode: number;
  message: string;
  stdErr: string;
  stdOut: string;
}

/**
 * Synchronously run a shell command, returning error and output
 */
function exec(cmd: string, cwd?: string): [null | ErrData, string] {
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
function out(cmd: string, cwd?: string): boolean {
  const parts = cmd.split(/ +/g);
  const { status } = spawnSync(parts.shift(), parts, {
    stdio: `inherit`,
    ...(cwd ? { cwd } : {}),
  });
  return status === 0;
}

/**
 * Run a command, returning the stdout as a string.
 * If the command was unsuccessful (exit=1)
 * log the error and immediately exit 1
 */
function exit(cmd: string, cwd?: string): string {
  const [err, msg] = exec(cmd, cwd);
  if (!err) {
    return msg;
  }

  console.error(`\x1b[31mEXEC CMD ERROR: \`${cmd}\`\n\n${err.message}\x1b[0m`);
  process.exit(1);
}

/**
 * Run a command, swallowing all output, only returning
 * a single boolean representing the exit status of the command.
 */
function success(cmd: string, cwd?: string): boolean {
  const [err] = exec(cmd, cwd);
  return !err;
}

/**
 * Async (promisified) version of exec
 */
function execAsync(cmd: string, cwd?: string): Promise<[null | ErrData, string]> {
  return new Promise((resolve) => {
    coreExec(cmd, { ...(cwd ? { cwd } : {}) }, (err, stdout, stderr) => {
      if (err) {
        resolve([
          {
            exitCode: err.code,
            message: err.message,
            stdErr: stderr.toString(),
            stdOut: stdout.toString(),
          },
          err.message,
        ]);
        return;
      }
      resolve([null, stdout.toString()]);
    });
  });
}

/**
 * Async (promisified) version of exec.exit
 */
async function execAsyncSuccess(cmd: string, cwd?: string): Promise<boolean> {
  const [err] = await execAsync(cmd, cwd);
  return !err;
}

/**
 * Async (promisified) version of exec.exit
 */
async function execAsyncExit(cmd: string, cwd?: string): Promise<string> {
  const [err, msg] = await execAsync(cmd, cwd);
  if (!err) {
    return msg;
  }
  console.error(`\x1b[31mEXEC (ASYNC) CMD ERROR: \`${cmd}\`\n\n${err.message}\x1b[0m`);
  process.exit(1);
}

export default Object.assign(exec, {
  out,
  success,
  exit,
  async: Object.assign(execAsync, {
    success: execAsyncSuccess,
    exit: execAsyncExit,
  }),
});
