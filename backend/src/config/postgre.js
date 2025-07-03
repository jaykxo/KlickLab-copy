require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.POSTGRE_USER,
    host: process.env.POSTGRE_HOST,
    database: process.env.POSTGRE_DB,
    password: process.env.POSTGRE_PW,
    port: process.env.POSTGRE_PORT,
});

module.exports = pool;
