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
		const { yesterdayData } = await yesterdayRes.json();
		const yesterdayVisitors = yesterdayData[0]?.visitors ?? 0;

		// 오늘 방문자 수
		const visitorRes = await clickhouse.query({
			query: `
				SELECT countDistinct(client_id) AS visitors
				FROM events
				WHERE date(timestamp) = today()
			`,
			format: 'JSON'
		});
		const { TodayData } = await visitorRes.json();
		const todayVisitors = +TodayData[0]?.visitors || 0;
	
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

module.exports = router;
