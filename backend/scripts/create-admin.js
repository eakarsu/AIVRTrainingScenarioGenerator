'use strict';
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

async function main() {
  if (process.env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') throw new Error('Explicit bootstrap acknowledgement is required');
  const email = (process.env.PROVISION_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.PROVISION_ADMIN_PASSWORD || '';
  const name = (process.env.PROVISION_ADMIN_NAME || '').trim().split(/\s+/, 2);
  const tenantId = (process.env.TENANT_ID || '').trim();
  if (!email || !tenantId || !name[0] || password.length < 12) throw new Error('Admin email, name, tenant, and a 12+ character password are required');
  const existing = await User.findOne({ where: { email } });
  const attributes = { email, password: await bcrypt.hash(password, 12), firstName: name[0], lastName: name[1] || 'Admin', role: 'admin', tenantId };
  if (existing) {
    await existing.update(attributes);
    return console.log('Runtime admin credentials refreshed.');
  }
  await User.create(attributes);
  console.log('Initial admin created.');
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => sequelize.close());
