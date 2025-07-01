const express = require('express');
const cors = require('cors');
const app = express();
const path = require("path");
const PORT = 3000;

// const pool = require('./src/config/postgre');
const connectMongo = require("./src/config/mongo");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
// app.use(cors());
app.use(cors({
  origin: '*',
  methods: ['POST'],
}));

app.post('/api/analytics/collect', async (req, res) => {
  const data = req.body;

  try {
    const db = await connectMongo();
    const logs = db.collection('logs');

    await logs.insertOne({
      event_name: data.event_name,
      timestamp: data.timestamp,
      client_id: data.client_id,
      user_id: data.user_id,
      session_id: data.session_id,

      // flatten properties
      page_path: data.properties?.page_path ?? null,
      page_title: data.properties?.page_title ?? null,
      referrer: data.properties?.referrer ?? null,

      // flatten device context
      device_type: data.context?.device?.device_type ?? null,
      os: data.context?.device?.os ?? null,
      browser: data.context?.device?.browser ?? null,
      language: data.context?.device?.language ?? null,

      // flatten geo context
      timezone: data.context?.geo?.timezone ?? null,

      // flatten traffic_source
      traffic_medium: data.context?.traffic_source?.traffic_medium ?? null,
      traffic_source: data.context?.traffic_source?.traffic_source ?? null,
      traffic_campaign: data.context?.traffic_source?.campaign ?? null,

      // flatten user meta
      user_gender: data.user_gender,
      user_age: data.user_age,

      // 원본도 같이 저장 (optional)
      properties: data.properties,
      context: data.context
    });

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('MongoDB INSERT ERROR:', err);
    res.status(500).json({ error: 'MongoDB insert failed' });
  }
});

app.listen(PORT, () => {
  console.log(`KlickLab 서버 실행 중: http://localhost:${PORT}`);
});
