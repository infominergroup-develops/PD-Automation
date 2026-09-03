// Secure logger that strictly adheres to security requirements:
// NEVER log full PDF contents, PAN numbers, phone numbers, or passwords.

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    const sanitized = sanitizeMeta(meta);
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, sanitized ? JSON.stringify(sanitized) : '');
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    const sanitized = sanitizeMeta(meta);
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, sanitized ? JSON.stringify(sanitized) : '');
  },
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    const sanitized = sanitizeMeta(meta);
    const errMessage = error instanceof Error ? error.message : String(error || '');
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}: ${errMessage}`, sanitized ? JSON.stringify(sanitized) : '');
  },
};

function sanitizeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const copy: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('pan') || lowerKey.includes('phone') || lowerKey.includes('secret') || lowerKey.includes('pdf') || lowerKey.includes('password') || lowerKey.includes('key')) {
      copy[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      copy[key] = sanitizeMeta(value as Record<string, unknown>);
    } else {
      copy[key] = value;
    }
  }
  return copy;
}
