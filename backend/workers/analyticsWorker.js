const connectMongo = require("../src/config/mongo");
const redis = require("../src/config/redis");
const { transformToEntry } = require("../services/transformToEntry");

const BATCH_SIZE = 100;
const POLL_INTERVAL_MS = 1000;

function startWorker() {
  connectMongo().then((db) => {
    const logs = db.collection("logs");

    setInterval(async () => {
      const entries = [];

      for (let i = 0; i < BATCH_SIZE; i++) {
        const msg = await redis.rpop("analytics_queue");
        if (!msg) break;

        try {
          const parsed = JSON.parse(msg);
          entries.push(transformToEntry(parsed));
        } catch (e) {
          console.error("Invalid JSON or transform error:", e);
        }
      }

      if (entries.length > 0) {
        try {
          await logs.insertMany(entries);
          console.log(`Inserted ${entries.length} entries`);
        } catch (e) {
          console.error("MongoDB insertMany ERROR:", e);
        }
      }
    }, POLL_INTERVAL_MS);
  }).catch((err) => {
    console.error("MongoDB connection failed:", err);
  });
}

startWorker();