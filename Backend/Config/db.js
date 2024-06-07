const { Sequelize } = require('sequelize');
require('dotenv').config()

const sequelize = new Sequelize(process.env.mySQL_uri, {
  host: process.env.host,
  port: process.env.PORT,
  dialect: 'mysql',
});

module.exports = sequelize;

