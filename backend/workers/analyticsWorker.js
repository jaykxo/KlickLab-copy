const connectMongo = require("../src/config/mongo");
const { transformToEntry } = require("../services/transformToEntry");
const { dequeueAnalytics } = require("../src/config/queue");

const BATCH_SIZE = 100;
const POLL_INTERVAL_MS = 1000;

function startWorker() {
  connectMongo()
    .then((db) => {
      const logs = db.collection("logs");

      setInterval(async () => {
        const entries = [];

        for (let i = 0; i < BATCH_SIZE; i++) {
          const data = await dequeueAnalytics();
          if (!data) break;

          try {
            const entry = transformToEntry(data);
            entries.push(entry);
          } catch (e) {
            console.error("transformToEntry failed:", e);
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
    })
    .catch((err) => {
      console.error("MongoDB connection failed:", err);
    });
}

startWorker();