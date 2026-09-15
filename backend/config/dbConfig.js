require('dotenv').config();
const { Sequelize } = require('sequelize');

const sslOptions = process.env.DB_SSL === 'false' ? {} : {
  ssl: { require: true, rejectUnauthorized: false },
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: sslOptions,
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_SERVER,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        dialectOptions: sslOptions,
        logging: false,
      }
    );

module.exports = sequelize;
