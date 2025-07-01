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

    const utcDate = new Date(data.timestamp);
    const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

    await logs.insertOne({
      event_name: data.event_name,
      timestamp: kstDate.toISOString(),
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

app.get('/api/button-clicks', async (req, res) => {
  // const data = req.body;
  const query = req.query;
  // console.log(query);
  try {
    const db = await connectMongo();
    const logs = db.collection('logs');

    const andConditions = [
      { event_name: "auto_click" },
      { "properties.target_text": /^button [1-7]$/ },
      { "properties.is_button": true },
    ];
    
    const orConditions = [];
    if (Object.keys(query).length > 0) {
      // console.log(query.platform);
      orConditions.push({ device_type: query.platform });
      orConditions.push({ os: query.platform });
      andConditions.push({ $or: orConditions });
    }
    // console.log(JSON.stringify(andConditions, null, 2));
    const queries = await logs.find({ $and: andConditions }).toArray();

    let clicks = [0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < queries.length; i++) {
      const tmp = queries[i].properties.target_text;
      clicks[Number(tmp.charAt(tmp.length - 1))]++;
    }

    const buttonClicks = Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => {
        const index = i + 1; // 1부터 시작
        return [`button${index}`, clicks[index]];
      })
    );

    const clickEvents = queries.map(q => ({
      element_path: q.properties?.element_path ?? '',
      target_text: q.properties?.target_text ?? '',
    }));

    res.status(200).json({ buttonClicks: buttonClicks, clickEvents: clickEvents });
  } catch (err) {
    console.error('MongoDB FIND ERROR:', err);
    res.status(500).json({ error: 'MongoDB find failed' });
  }
});

app.listen(PORT, () => {
  console.log(`KlickLab 서버 실행 중: http://localhost:${PORT}`);
});
