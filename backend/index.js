const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const PORT = 3001;

// PostgreSQL 연결 설정
const pool = require('./src/config/db');

// JSON 파싱 미들웨어
app.use(express.json());

// POST 수신 엔드포인트
app.post('/collect', async (req, res) => {
  const data = req.body;

  try {
    await pool.query(
      `INSERT INTO test1 (
        event_name, timestamp, client_id, user_id, session_id,
        page_path, page_title, referrer, properties,
        device_type, os, browser, language, timezone,
        traffic_medium, traffic_source, traffic_campaign, context
      ) VALUES (
        $1, to_timestamp($2 / 1000.0), $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13, $14,
        $15, $16, $17, $18
      )`,
      [
        data.event_name,
        data.timestamp,
        data.client_id,
        data.user_id,
        data.session_id,

        data.properties?.page_path,
        data.properties?.page_title,
        data.properties?.referrer,
        data.properties,

        data.context?.device?.type,
        data.context?.device?.os,
        data.context?.device?.browser,
        data.context?.device?.language,
        data.context?.geo?.timezone,

        data.context?.traffic_source?.medium,
        data.context?.traffic_source?.source,
        data.context?.traffic_source?.campaign,
        data.context
      ]
    );

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('DB INSERT ERROR:', err);
    res.status(500).json({ error: 'DB insert failed' });
  }
});

app.listen(PORT, () => {
  console.log(`KlickLab 서버 실행 중: http://localhost:${PORT}`);
});
