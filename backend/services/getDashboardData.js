const clickhouse = require('../src/config/clickhouse');

async function getDashboardData() {
  const yesterdayRes = await clickhouse.query({
    query: `
      SELECT clicks, visitors
      FROM daily_metrics
      WHERE date = yesterday();
    `,
    format: 'JSONEachRow'
  });
  const [yesterday] = await yesterdayRes.json();

  // 1) 일일 방문자 수
  const visitorRes = await clickhouse.query({
    query: `
      SELECT countDistinct(client_id) AS visitors
      FROM events
      WHERE date(timestamp) >= today()
    `,
    format: 'JSONEachRow'
  });
  const [visitorRow] = await visitorRes.json();
  const visitors = +visitorRow.visitors || 0;

  const visitorsRate = yesterday.visitors
    ? +(((visitors - yesterday.visitors) / yesterday.visitors) * 100).toFixed(1)
    : 0;

  // 2) 일일 클릭 수
  const clickCountRes = await clickhouse.query({
    query: `
      SELECT count() AS clicks
      FROM events
      WHERE date(timestamp) >= today() AND event_name = 'auto_click'
    `,
    format: 'JSONEachRow'
  });
  const [clickCountRow] = await clickCountRes.json();
  const clicks = +clickCountRow.clicks || 0;

  const clicksRate = yesterday.clicks
    ? +(((clicks - yesterday.clicks) / yesterday.clicks) * 100).toFixed(1)
    : 0;

  // 3) Top 5 클릭 요소
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
  const topClicks = await topClicksRes.json();

  // 4) 클릭 트렌드 라인차트 (시간대별 클릭 수)
  const trendRes = await clickhouse.query({
    query: `
      SELECT formatDateTime(timestamp, '%H:00') AS hour, count() AS cnt
      FROM events
      WHERE date(timestamp) >= today() AND event_name = 'auto_click'
      GROUP BY hour
      ORDER BY hour
    `,
    format: 'JSONEachRow'
  });
  const clickTrend = await trendRes.json();

  // 5) 요약 문장 생성 (간단 규칙 기반)
  let summary = "";
  if (clicks > 0) {
    const peak = clickTrend.reduce((max, cur) => (+cur.cnt > +max.cnt ? cur : max), { cnt: 0 });
    const top = topClicks[0]?.target_text || '알 수 없음';
    summary = `${peak.hour}에 클릭이 집중되었고, 가장 많이 클릭된 요소는 '${top}'입니다.`;
  } else {
    summary = "오늘은 클릭된 이벤트가 없습니다.";
  }

  return {
    visitors,
    visitorsRate,
    clicks,
    clicksRate,
    topClicks,
    clickTrend,
    summary
  };
}

module.exports = { getDashboardData };
