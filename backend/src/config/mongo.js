require("dotenv").config();
const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB;

const client = new MongoClient(MONGO_URI);

async function connectMongo() {
    if (!client.topology?.isConnected()) {
        await client.connect();
        console.log("Connected to MongoDB");
    }
    return client.db(DB_NAME);
}

module.exports = connectMongo;
