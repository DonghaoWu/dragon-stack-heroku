require('dotenv').config();
const { Client } = require('pg');

const dbSetting = process.env.DATABASE_URL ?
    {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }
    :
    {
        user: process.env.POSTGRE_USER,
        host: process.env.POSTGRE_HOST,
        database: process.env.POSTGRE_LOCAL_DATABASE,
        password: process.env.POSTGRE_password,
        port: process.env.POSTGRE_PORT
    }

const db = new Client(dbSetting);

module.exports = db;