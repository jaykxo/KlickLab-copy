const connectMongo = require("../src/config/mongo");
const { transformToEntry } = require("../services/transformToEntry");
const { consumeAnalytics } = require("../src/config/queue");

const BATCH_SIZE = 100;
const FLUSH_INTERVAL_MS = 1000;

let entries = [];
let lastFlushTime = Date.now();

async function maybeFlush(logs) {
  const now = Date.now();
  const shouldFlush = entries.length >= BATCH_SIZE || now - lastFlushTime >= FLUSH_INTERVAL_MS;

  if (shouldFlush && entries.length > 0) {
    try {
      await logs.insertMany(entries);
      console.log(`Flushed ${entries.length} entries`);
      entries = [];
      lastFlushTime = now;
    } catch (e) {
      console.error("MongoDB insertMany ERROR:", e);
    }
  }
}

async function startWorker() {
  const db = await connectMongo();
  const logs = db.collection("logs");

  setInterval(() => maybeFlush(logs), FLUSH_INTERVAL_MS);

  await consumeAnalytics(async (data) => {
    try {
      const entry = transformToEntry(data);
      entries.push(entry);
      await maybeFlush(logs);
    } catch (e) {
      console.error("transformToEntry error:", e);
    }
  });
}

startWorker();