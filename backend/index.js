const express = require('express');
const cors = require('cors');
const app = express();
const path = require("path");
const PORT = 3000;

const pool = require('./src/config/postgre');
const connectMongo = require("./src/config/mongo");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
// app.use(cors());
app.use(cors({
  origin: '*',
  methods: ['POST'],
}));

// app.post('/collect', async (req, res) => {
//   const data = req.body;

//   try {
//     await pool.query(
//       `INSERT INTO test1 (
//         event_name, timestamp, client_id, user_id, session_id,
//         page_path, page_title, referrer, properties,
//         device_type, os, browser, language, timezone,
//         traffic_medium, traffic_source, traffic_campaign, context,
//         user_gender, user_age
//       ) VALUES (
//         $1, to_timestamp($2 / 1000.0), $3, $4, $5,
//         $6, $7, $8, $9,
//         $10, $11, $12, $13, $14,
//         $15, $16, $17, $18,
//         $19, $20
//       )`,
//       [
//         data.event_name,
//         data.timestamp,
//         data.client_id,
//         data.user_id,
//         data.session_id,

//         data.properties?.page_path,
//         data.properties?.page_title,
//         data.properties?.referrer,
//         data.properties,

//         data.context?.device?.type,
//         data.context?.device?.os,
//         data.context?.device?.browser,
//         data.context?.device?.language,
//         data.context?.geo?.timezone,

//         data.context?.traffic_source?.medium,
//         data.context?.traffic_source?.source,
//         data.context?.traffic_source?.campaign,
//         data.context,

//         data.user_age,
//         data.user_gender 
//       ]
//     );

//     res.status(200).json({ status: 'ok' });
//   } catch (err) {
//     console.error('DB INSERT ERROR:', err);
//     res.status(500).json({ error: 'DB insert failed' });
//   }
// });

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
      device_type: data.context?.device?.type ?? null,
      os: data.context?.device?.os ?? null,
      browser: data.context?.device?.browser ?? null,
      language: data.context?.device?.language ?? null,

      // flatten geo context
      timezone: data.context?.geo?.timezone ?? null,

      // flatten traffic_source
      traffic_medium: data.context?.traffic_source?.medium ?? null,
      traffic_source: data.context?.traffic_source?.source ?? null,
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
