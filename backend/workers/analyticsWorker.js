const clickhouse = require("../src/config/clickhouse");
const { transformToEntry } = require("../services/transformToEntry");
const { consumeAnalytics } = require("../src/config/queue");

const BATCH_SIZE = 100;
const FLUSH_INTERVAL_MS = 1000;

let entries = [];
let lastFlushTime = Date.now();

async function maybeFlush() {
  const now = Date.now();
  const shouldFlush = entries.length >= BATCH_SIZE || now - lastFlushTime >= FLUSH_INTERVAL_MS;

  if (shouldFlush && entries.length > 0) {
    try {
      await clickhouse.insert({
        table: 'logs',
        values: entries,
        format: 'JSONEachRow',
      });

      console.log(`Flushed ${entries.length} entries to ClickHouse`);
      entries = [];
      lastFlushTime = now;
    } catch (e) {
      console.error("ClickHouse INSERT ERROR:", e);
    }
  }
}

async function startWorker() {
  setInterval(() => maybeFlush(), FLUSH_INTERVAL_MS);

  await consumeAnalytics(async (data) => {
    try {
      const entry = transformToEntry(data);
      entries.push(entry);
      await maybeFlush();
    } catch (e) {
      console.error("transformToEntry error:", e);
    }
  });
}

startWorker();