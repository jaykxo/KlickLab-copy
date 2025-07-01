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

/* analytics 라우팅 */
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

/* 데모용 테스트 API */
app.get('/api/button-clicks', async (req, res) => {
  // const data = req.body;
  try {
    const db = await connectMongo();
    const logs = db.collection('logs');

    const queries = await logs
      .find({
        $and: [
          { event_name: "auto_click" },
          { "properties.target_text": /^Button [1-7]$/ },
          { "properties.is_button": true }
        ]
      })
      .toArray();

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

    const clickEvents = Array.from({ length: 7 }, (_, i) => {
      const index = i + 1;
      return {
        element_path: `button:nth-child(${index})`,
        target_text: `Button ${index}`,
      };
    });

    res.status(200).json({ buttonClicks: buttonClicks, clickEvents: clickEvents });
  } catch (err) {
    console.error('MongoDB FIND ERROR:', err);
    res.status(500).json({ error: 'MongoDB find failed' });
  }
});

app.listen(PORT, () => {
  console.log(`KlickLab 서버 실행 중: http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Welcome to the KlickLab!');
});