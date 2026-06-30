'use strict';

// CLI: `npm run make-admin -- <email>` — promote a user to the admin role.

const { prisma } = require('./lib/prisma');
const logger = require('./lib/logger');

async function makeAdmin(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    logger.warn(`User with email ${email} not found`);
    return;
  }
  if (user.role === 'admin') {
    logger.info(`${email} is already an admin`);
    return;
  }
  const updated = await prisma.user.update({ where: { email }, data: { role: 'admin' } });
  logger.info(`${updated.email} promoted to admin`);
}

const email = process.argv[2];
if (!email) {
  // eslint-disable-next-line no-console
  console.log('Usage: npm run make-admin -- <email>');
  process.exit(1);
}

makeAdmin(email)
  .catch((err) => {
    logger.error('make-admin failed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
