'use strict';

const { sequelize } = require('../models');

async function main() {
  await sequelize.sync();
  await sequelize.query(`CREATE TABLE IF NOT EXISTS ai_results (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    endpoint TEXT NOT NULL,
    input_data JSONB NOT NULL DEFAULT '{}',
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  await sequelize.query('CREATE INDEX IF NOT EXISTS ai_results_user_created_idx ON ai_results(user_id, created_at DESC)');
  console.log('Runtime schema is ready.');
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => sequelize.close());
