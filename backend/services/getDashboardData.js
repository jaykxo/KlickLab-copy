const clickhouse = require('../src/config/clickhouse');

async function getDashboardData() {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const todayKst = new Date(now.getTime() + kstOffset);
  todayKst.setHours(0, 0, 0, 0);
  const todayStr = new Date(todayKst.getTime() - kstOffset).toISOString().slice(0, 19).replace('T', ' ');

  // 1) 일일 방문자 수
  const visitorRes = await clickhouse.query({
    query: `
      SELECT countDistinct(client_id) AS visitors
      FROM ${process.env.CLICKHOUSE_TABLE}
      WHERE timestamp >= '${todayStr}'
    `,
    format: 'JSONEachRow'
  });
  const [visitorRow] = await visitorRes.json();
  const visitors = +visitorRow.visitors || 0;

  // 2) 일일 클릭 수
  const clickCountRes = await clickhouse.query({
    query: `
      SELECT count() AS clicks
      FROM ${process.env.CLICKHOUSE_TABLE}
      WHERE timestamp >= '${todayStr}' AND event_name = 'auto_click'
    `,
    format: 'JSONEachRow'
  });
  const [clickCountRow] = await clickCountRes.json();
  const clicks = +clickCountRow.clicks || 0;

  // 3) Top 5 클릭 요소
  const topClicksRes = await clickhouse.query({
    query: `
      SELECT target_text, count() AS cnt
      FROM ${process.env.CLICKHOUSE_TABLE}
      WHERE timestamp >= '${todayStr}' AND event_name = 'auto_click' AND target_text != ''
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
      FROM ${process.env.CLICKHOUSE_TABLE}
      WHERE timestamp >= '${todayStr}' AND event_name = 'auto_click'
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
    clicks,
    topClicks,
    clickTrend,
    summary
  };
}

module.exports = { getDashboardData };
