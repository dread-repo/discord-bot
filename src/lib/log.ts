/** Structured stderr logging (eslint no-console bypass). */
export function logInfo(message: string): void {
  process.stderr.write(`${message}\n`);
}

export function logError(message: string, err?: unknown): void {
  const detail =
    err === undefined
      ? undefined
      : err instanceof Error
        ? (err.stack ?? err.message)
        : typeof err === 'string'
          ? err
          : JSON.stringify(err);
  process.stderr.write(
    detail === undefined ? `${message}\n` : `${message}: ${detail}\n`,
  );
}
