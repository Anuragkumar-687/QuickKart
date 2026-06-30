'use strict';

const env = require('../config/env');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const threshold = env.isProd ? LEVELS.info : LEVELS.debug;

function prefix(level) {
  return `[${new Date().toISOString()}] [${level.toUpperCase()}]`;
}

const logger = {
  error: (...args) => {
    if (threshold >= LEVELS.error) console.error(prefix('error'), ...args);
  },
  warn: (...args) => {
    if (threshold >= LEVELS.warn) console.warn(prefix('warn'), ...args);
  },
  info: (...args) => {
    if (threshold >= LEVELS.info) console.log(prefix('info'), ...args);
  },
  debug: (...args) => {
    if (threshold >= LEVELS.debug) console.log(prefix('debug'), ...args);
  },
};

module.exports = logger;
