type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  DIM: '\x1b[2m',
  INFO: '\x1b[32m', // Green
  WARN: '\x1b[33m', // Yellow
  ERROR: '\x1b[31m', // Red
  DEBUG: '\x1b[36m', // Cyan
  SYSTEM: '\x1b[35m', // Magenta
};

function formatMessage(level: LogLevel, message: string, meta?: any): string {
  const timestamp = new Date().toISOString();
  let levelColor = COLORS.INFO;

  switch (level) {
    case 'WARN':
      levelColor = COLORS.WARN;
      break;
    case 'ERROR':
      levelColor = COLORS.ERROR;
      break;
    case 'DEBUG':
      levelColor = COLORS.DEBUG;
      break;
  }

  const metaString = meta 
    ? `\n${COLORS.DIM}${JSON.stringify(meta, null, 2)}${COLORS.RESET}` 
    : '';

  return `${COLORS.DIM}[${timestamp}]${COLORS.RESET} ${levelColor}${COLORS.BRIGHT}[${level}]${COLORS.RESET} ${message}${metaString}`;
}

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(formatMessage('INFO', message, meta));
  },
  warn: (message: string, meta?: any) => {
    console.warn(formatMessage('WARN', message, meta));
  },
  error: (message: string, error?: any) => {
    const meta = error instanceof Error 
      ? { message: error.message, stack: error.stack } 
      : error;
    console.error(formatMessage('ERROR', message, meta));
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
      console.log(formatMessage('DEBUG', message, meta));
    }
  }
};

export default logger;
