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

// Traffic 탭 통합 API
app.get('/api/dashboard/traffic', async (req, res) => {
  try {
    const db = await connectMongo();
    const logs = db.collection('logs');
    
    const { period = 'daily', gender = 'all', ageGroup = 'all' } = req.query;
    
    // 기간별 날짜 계산
    let startDate, endDate;
    const now = new Date();
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        endDate = now;
    }
    
    // 기본 매치 조건
    let matchConditions = {
      timestamp: {
        $gte: startDate,
        $lte: endDate
      },
      event_name: 'auto_click'
    };
    
    // 성별 필터링
    if (gender !== 'all') {
      matchConditions['context.traits.gender'] = gender;
    }
    
    // 나이대 필터링
    if (ageGroup !== 'all') {
      let ageRange;
      switch (ageGroup) {
        case '10s':
          ageRange = { $gte: 10, $lt: 20 };
          break;
        case '20s':
          ageRange = { $gte: 20, $lt: 30 };
          break;
        case '30s':
          ageRange = { $gte: 30, $lt: 40 };
          break;
        case '40s':
          ageRange = { $gte: 40, $lt: 50 };
          break;
        case '50s':
          ageRange = { $gte: 50, $lt: 60 };
          break;
        case '60s+':
          ageRange = { $gte: 60 };
          break;
      }
      if (ageRange) {
        matchConditions['context.traits.age'] = ageRange;
      }
    }
    
    // 1. 방문자 트렌드 데이터 (필터 적용하지 않음 - 항상 전체 데이터)
    const visitorTrend = await logs.aggregate([
      {
        $match: {
          timestamp: {
            $gte: startDate,
            $lte: endDate
          },
          event_name: 'auto_click'
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            user_id: '$user_id'
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          uniqueVisitors: { $sum: 1 },
          totalVisitors: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      },
      {
        $project: {
          date: '$_id',
          visitors: '$totalVisitors',
          newVisitors: '$uniqueVisitors',
          returningVisitors: { $subtract: ['$totalVisitors', '$uniqueVisitors'] },
          _id: 0
        }
      }
    ]).toArray();
    
    // 2. 메인 페이지에서 이동하는 페이지 Top 10 (필터 적용)
    const mainPageNavigation = await logs.aggregate([
      {
        $match: {
          ...matchConditions,
          'properties.page_path': { $ne: '/' } // 메인 페이지가 아닌 페이지로의 이동
        }
      },
      {
        $group: {
          _id: '$properties.page_path',
          clicks: { $sum: 1 },
          uniqueClicks: { $addToSet: '$user_id' }
        }
      },
      {
        $project: {
          name: '$_id',
          page: '$_id',
          clicks: 1,
          uniqueClicks: { $size: '$uniqueClicks' },
          clickRate: { $multiply: [{ $divide: ['$clicks', 100] }, 100] }, // 임시 계산
          avgTimeToClick: 3.2, // 임시 값
          rank: 1,
          _id: 0
        }
      },
      {
        $sort: { clicks: -1 }
      },
      {
        $limit: 10
      }
    ]).toArray();
    
    // 랭킹 추가
    mainPageNavigation.forEach((item, index) => {
      item.rank = index + 1;
      item.id = (index + 1).toString();
    });
    
    res.status(200).json({
      visitorTrend,
      mainPageNavigation,
      filters: { period, gender, ageGroup }
    });
  } catch (err) {
    console.error('Traffic Dashboard API ERROR:', err);
    res.status(500).json({ error: 'Failed to get traffic dashboard data' });
  }
});

app.listen(PORT, () => {
  console.log(`KlickLab 서버 실행 중: http://localhost:${PORT}`);
});
