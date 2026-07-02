/**
 * Typed error classes for the UPT CLI.
 *
 * `UsageError` signals a malformed invocation (bad flags, missing values,
 * unknown flags) — callers map it to exit code 2. `CliError` signals a
 * runtime failure within an otherwise well-formed invocation — exit code 1.
 */

export class UsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UsageError';
  }
}

export class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CliError';
  }
}
