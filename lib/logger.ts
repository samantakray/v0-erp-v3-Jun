// Logger utility for consistent logging across the application

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogOptions {
  level?: LogLevel
  data?: any
  error?: any
  duration?: number
}

export const logger = {
  debug: (message: string, options?: Omit<LogOptions, "level">) => log(message, { ...options, level: "debug" }),
  info: (message: string, options?: Omit<LogOptions, "level">) => log(message, { ...options, level: "info" }),
  warn: (message: string, options?: Omit<LogOptions, "level">) => log(message, { ...options, level: "warn" }),
  error: (message: string, options?: Omit<LogOptions, "level">) => log(message, { ...options, level: "error" }),
}

function log(message: string, options: LogOptions = {}) {
  const { level = "info", data, error, duration } = options

  const timestamp = new Date().toISOString()
  const logObject: any = {
    timestamp,
    level,
    message,
  }

  if (data !== undefined) {
    logObject.data = typeof data === "object" ? sanitizeData(data) : data
  }

  if (error) {
    logObject.error = error instanceof Error ? { message: error.message, stack: error.stack } : error
  }

  if (duration !== undefined) {
    logObject.duration = `${duration.toFixed(2)}ms`
  }

  switch (level) {
    case "debug":
      console.debug(`[DEBUG] ${timestamp} - ${message}`, logObject)
      break
    case "info":
      console.info(`[INFO] ${timestamp} - ${message}`, logObject)
      break
    case "warn":
      console.warn(`[WARN] ${timestamp} - ${message}`, logObject)
      break
    case "error":
      console.error(`[ERROR] ${timestamp} - ${message}`, logObject)
      break
  }
}

// Sanitize sensitive data before logging
function sanitizeData(data: any): any {
  if (!data) return data

  // Create a deep copy to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(data))

  // List of keys that might contain sensitive information
  const sensitiveKeys = ["password", "token", "key", "secret", "auth", "credential"]

  // Recursively sanitize the object
  function sanitizeObject(obj: any) {
    if (!obj || typeof obj !== "object") return

    Object.keys(obj).forEach((key) => {
      // Check if this key might contain sensitive data
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        obj[key] = "[REDACTED]"
      } else if (typeof obj[key] === "object") {
        sanitizeObject(obj[key])
      }
    })
  }

  sanitizeObject(sanitized)
  return sanitized
}
