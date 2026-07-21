const { Sequelize } = require('sequelize');
const { databaseUrl } = require('./security');
const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
  });

module.exports = sequelize;
