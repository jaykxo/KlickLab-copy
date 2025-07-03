require("dotenv").config();
const Redis = require('ioredis');

const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_HOST = process.env.REDIS_HOST;

const redis = new Redis(REDIS_PORT, REDIS_HOST);

module.exports = redis;