interface LogContext {
  readonly requestId?: string;
  readonly traceId?: string;
  readonly [key: string]: unknown;
}

function writeLog(level: "info" | "error" | "warn", message: string, context: LogContext = {}): void {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

export function logInfo(message: string, context?: LogContext): void {
  writeLog("info", message, context);
}

export function logError(message: string, context?: LogContext): void {
  writeLog("error", message, context);
}

export function logWarn(message: string, context?: LogContext): void {
  writeLog("warn", message, context);
}
