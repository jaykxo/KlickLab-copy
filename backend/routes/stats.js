const express = require("express");
const router = express.Router();
const clickhouse = require('../src/config/clickhouse');

router.get('/visitors', async (req, res) => {
  try {
		const yesterdayRes = await clickhouse.query({
			query: `
				SELECT visitors
				FROM daily_metrics
				WHERE date = yesterday();
			`,
			format: 'JSON'
		});
		const yesterdayVisitors = (await yesterdayRes.json()).data[0]?.visitors ?? 0;

		// 오늘 방문자 수
		const visitorRes = await clickhouse.query({
			query: `
				SELECT countDistinct(client_id) AS visitors
				FROM events
				WHERE date(timestamp) = today()
			`,
			format: 'JSON'
		});
		const todayVisitors = +(await visitorRes.json()).data[0]?.visitors || 0;
	
		// const visitorsRate = yesterday.visitors
		// 	? +(((visitors - yesterday.visitors) / yesterday.visitors) * 100).toFixed(1)
		// 	: 0;
    
    res.status(200).json({
      today: todayVisitors,
      yesterday: yesterdayVisitors
    });
  } catch (err) {
    console.error('Visitors API ERROR:', err);
    res.status(500).json({ error: 'Failed to get visitors data' });
  }
});

router.get('/clicks', async (req, res) => {
	try {
		const yesterdayRes = await clickhouse.query({
			query: `
				SELECT clicks
				FROM daily_metrics
				WHERE date = yesterday();
			`,
			format: 'JSON'
		});
		const yesterdayClicks = (await yesterdayRes.json()).data[0]?.clicks ?? 0;

		// 오늘 방문자 수
		const clickRes = await clickhouse.query({
			query: `
				SELECT count() AS clicks
				FROM events
				WHERE date(timestamp) >= today() AND event_name = 'auto_click'
			`,
			format: 'JSON'
		});
		const todayClicks = +(await clickRes.json()).data[0]?.clicks || 0;
    
    res.status(200).json({
      today: todayClicks,
      yesterday: yesterdayClicks
    });
  } catch (err) {
    console.error('Clicks API ERROR:', err);
    res.status(500).json({ error: 'Failed to get clicks data' });
  }
});

router.get('/top-clicks', async (req, res) => {
  try {
		const topClicksRes = await clickhouse.query({
			query: `
				SELECT target_text, count() AS cnt
				FROM events
				WHERE date(timestamp) >= today() AND event_name = 'auto_click' AND target_text != ''
				GROUP BY target_text
				ORDER BY cnt DESC
				LIMIT 5
			`,
			format: 'JSONEachRow'
		});
		const topClicks = (await topClicksRes.json()).map(row => ({
			label: row.target_text,
			count: Number(row.cnt)
		}));
		res.status(200).json({ items: topClicks });
  } catch (err) {
    console.error('Top Clicks API ERROR:', err);
    res.status(500).json({ error: 'Failed to get top clicks data' });
  }
});

router.get('/click-trend', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

		const clickTrendRes = await clickhouse.query({
			query: `
				SELECT 
					formatDateTime(toStartOfFiveMinute(timestamp), '%R') AS time,
					count() AS count
				FROM events
				WHERE 
					event_name = 'auto_click'
					AND toDate(timestamp) = toDate('${date}')
				GROUP BY time
				ORDER BY time
			`,
			format: 'JSONEachRow'
		});

		// const clickTrend = await clickTrendRes.json();
		const rawTrend = await clickTrendRes.json();
		const clickTrend = rawTrend.map(row => ({
			time: row.time,
			count: Number(row.count)
		}));
		res.status(200).json({ data: clickTrend });
  } catch (err) {
    console.error('Click Trend API ERROR:', err);
    res.status(500).json({ error: 'Failed to get click trend data' });
  }
});

module.exports = router;
