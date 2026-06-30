'use strict';

// CLI: `npm run ingest` — populate / refresh the catalog from external APIs.

const ingestionService = require('../services/ingestionService');
const { prisma } = require('../lib/prisma');
const logger = require('../lib/logger');

(async () => {
  try {
    const summary = await ingestionService.syncAll();
    logger.info('[ingest:cli] done:\n' + JSON.stringify(summary, null, 2));
  } catch (err) {
    logger.error('[ingest:cli] failed:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
