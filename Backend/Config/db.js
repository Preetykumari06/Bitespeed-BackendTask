const { Sequelize } = require('sequelize');
require('dotenv').config()

const sequelize = new Sequelize(process.env.database_name, 'root', process.env.password, {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;
