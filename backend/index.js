const express = require('express');
const cors = require('cors');
const app = express();
const path = require("path");
const PORT = 3000;

const clickhouse = require("./src/config/clickhouse");
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
  const query = req.query;

  try {
    const where = [
      `event_name = 'auto_click'`,
      `is_button = 1`,
      `target_text REGEXP '^button [1-7]$'`,
      query.platform ? `(device_type = '${query.platform}' OR device_os = '${query.platform}')` : null
    ].filter(Boolean).join(' AND ');

    const result = await clickhouse.query({
      query: `
        SELECT element_path, target_text
        FROM events
        WHERE ${where}
      `,
      format: 'JSON',
    });

    const json = await result.json();
    const { data } = json;

    let clicks = [0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < data.length; i++) {
      const tmp = data[i].target_text;
      clicks[Number(tmp.charAt(tmp.length - 1))]++;
    }

    const buttonClicks = Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => {
        const index = i + 1;
        return [`button${index}`, clicks[index]];
      })
    );

    const clickEvents = data.map(q => ({
      element_path: q.element_path ?? '',
      target_text: q.target_text ?? '',
    }));

    res.status(200).json({ buttonClicks, clickEvents });
  } catch (err) {
    console.error('ClickHouse SELECT ERROR:', err);
    res.status(500).json({ error: 'ClickHouse query failed' });
  }
});

/* ▼ 수정해야함 */
// 오버뷰 탭 API들
app.get('/api/stats/visitors', async (req, res) => {
  try {
    const db = await connectMongo();
    const logs = db.collection('logs');
    
    const date = req.query.date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // 오늘 방문자 수 (유니크 userId)
    const todayVisitors = await logs.distinct('user_id', {
      timestamp: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lt: new Date(date + 'T23:59:59.999Z')
      },
      event_name: 'auto_click'
    });
    
    // 어제 방문자 수 (유니크 userId)
    const yesterdayVisitors = await logs.distinct('user_id', {
      timestamp: {
        $gte: new Date(yesterdayStr + 'T00:00:00.000Z'),
        $lt: new Date(yesterdayStr + 'T23:59:59.999Z')
      },
      event_name: 'auto_click'
    });
    
    res.status(200).json({
      today: todayVisitors.length,
      yesterday: yesterdayVisitors.length
    });
  } catch (err) {
    console.error('Visitors API ERROR:', err);
    res.status(500).json({ error: 'Failed to get visitors data' });
  }
});

app.get('/api/stats/clicks', async (req, res) => {
  try {
    const db = await connectMongo();
    const logs = db.collection('logs');
    
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // 오늘 클릭 수
    const todayClicks = await logs.countDocuments({
      timestamp: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lt: new Date(date + 'T23:59:59.999Z')
      },
      event_name: 'auto_click'
    });
    
    // 어제 클릭 수
    const yesterdayClicks = await logs.countDocuments({
      timestamp: {
        $gte: new Date(yesterdayStr + 'T00:00:00.000Z'),
        $lt: new Date(yesterdayStr + 'T23:59:59.999Z')
      },
      event_name: 'auto_click'
    });
    
    res.status(200).json({
      today: todayClicks,
      yesterday: yesterdayClicks
    });
  } catch (err) {
    console.error('Clicks API ERROR:', err);
    res.status(500).json({ error: 'Failed to get clicks data' });
  }
});

app.get('/api/stats/top-clicks', async (req, res) => {
  try {
    const db = await connectMongo();
    const logs = db.collection('logs');
    
    const date = req.query.date || new Date().toISOString().split('T')[0];
    
    // Top 5 클릭 요소 집계
    const topClicks = await logs.aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(date + 'T00:00:00.000Z'),
            $lt: new Date(date + 'T23:59:59.999Z')
          },
          event_name: 'auto_click'
        }
      },
      {
        $group: {
          _id: '$properties.target_text',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          label: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]).toArray();
    
    res.status(200).json({ items: topClicks });
  } catch (err) {
    console.error('Top Clicks API ERROR:', err);
    res.status(500).json({ error: 'Failed to get top clicks data' });
  }
});

app.get('/api/stats/click-trend', async (req, res) => {
  try {
    const db = await connectMongo();
    const logs = db.collection('logs');
    
    const date = req.query.date || new Date().toISOString().split('T')[0];
    
    // 5분 단위 클릭 트렌드 집계
    const clickTrend = await logs.aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(date + 'T00:00:00.000Z'),
            $lt: new Date(date + 'T23:59:59.999Z')
          },
          event_name: 'auto_click'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%H:%M',
              date: {
                $dateTrunc: {
                  date: '$timestamp',
                  unit: 'minute',
                  binSize: 5
                }
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      },
      {
        $project: {
          time: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]).toArray();
    
    res.status(200).json({ data: clickTrend });
  } catch (err) {
    console.error('Click Trend API ERROR:', err);
    res.status(500).json({ error: 'Failed to get click trend data' });
  }
});
/* ▲ 수정해야 함 */

app.listen(PORT, () => {
  console.log(`KlickLab 서버 실행 중: http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Welcome to the KlickLab!');
});