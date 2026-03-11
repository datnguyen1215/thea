/**
 * ao CLI integration layer - shells out to ao for agent operations.
 */
import { execSync } from "child_process";

const EXEC_TIMEOUT = 30_000;
const PROJECT = "thea";

/**
 * Strips stderr noise (notifier warnings) from ao output.
 * @param raw - Raw stdout buffer
 * @returns Cleaned string output
 */
const clean = (raw: Buffer): string => raw.toString().trim();

/**
 * Runs an ao CLI command and returns stdout.
 * @param args - CLI arguments
 * @returns Stdout string
 * @throws Error if command fails
 */
const run = (args: string): string => {
  try {
    const result = execSync(`ao ${args}`, {
      timeout: EXEC_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return clean(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`ao command failed: ao ${args} - ${message}`);
  }
};

/** @returns Parsed ao status JSON for the thea project */
export const getStatus = (): unknown => {
  const output = run(`status --json -p ${PROJECT}`);
  return JSON.parse(output);
};

/**
 * Spawns a new ao agent session.
 * @param issueId - Issue ID to associate with the session
 * @returns Session name
 */
export const spawn = (issueId: number): string => {
  return run(`spawn ${PROJECT}`);
};

/**
 * Sends a message to an ao session.
 * @param session - Session name
 * @param message - Message to send
 * @returns Command output
 */
export const send = (session: string, message: string): string => {
  const escaped = message.replace(/'/g, "'\\''");
  return run(`send ${session} '${escaped}'`);
};

/**
 * Kills an ao session.
 * @param session - Session name to kill
 * @returns Command output
 */
export const kill = (session: string): string => {
  return run(`session kill ${session}`);
};
