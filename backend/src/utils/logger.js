const levels = ['debug', 'info', 'warn', 'error'];

function write(level, message, meta = {}) {
  if (!levels.includes(level)) {
    return;
  }

  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...meta,
  };

  const line = JSON.stringify(entry);
  if (level === 'error') {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message, meta) => write('debug', message, meta),
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),
};
