'use strict';

const cron = require('node-cron');
const logger = require('../lib/logger');
const ingestionService = require('../services/ingestionService');
const trendingService = require('../services/trendingService');

/**
 * Background jobs (enabled with ENABLE_CRON=true).
 *
 * Uses node-cron (no external infra). For a distributed/queue-based setup the
 * upgrade path is BullMQ + Redis — the job bodies below can be moved into queue
 * workers unchanged.
 */
function start() {
  // Refresh the product catalog from external APIs daily at 03:00.
  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('[cron] catalog sync starting');
      await ingestionService.syncAll();
    } catch (err) {
      logger.error('[cron] catalog sync failed:', err.message);
    }
  });

  // Recompute regional trending rankings every 30 minutes.
  cron.schedule('*/30 * * * *', async () => {
    try {
      logger.info('[cron] trending recompute starting');
      await trendingService.recomputeAll();
    } catch (err) {
      logger.error('[cron] trending recompute failed:', err.message);
    }
  });

  logger.info('[cron] scheduled jobs started (catalog sync @03:00, trending @*/30m)');
}

module.exports = { start };
