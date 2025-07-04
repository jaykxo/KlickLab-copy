const clickhouse = require('../src/config/clickhouse');

async function getDashboardData() {
  // 1) 날짜 계산 (KST 기준 자정)
  const toKstMidnight = (date) => {
    const d = new Date(date.getTime() + 9 * 60 * 60000);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  };
  const todayKst = toKstMidnight(new Date());
  const sevenDaysAgoKst = new Date(todayKst.getTime() - 6 * 86400000);

  const fmt = (d) => d.toISOString().slice(0, 19).replace('T', ' ');
  const todayStr = fmt(todayKst);
  const sevenDaysAgoStr = fmt(sevenDaysAgoKst);

  // 2) 일일 방문자 수
  const todayVisRes = await clickhouse.query({
    query: `
      SELECT countDistinct(client_id) AS cnt
      FROM ${process.env.CLICKHOUSE_TABLE}
      WHERE timestamp >= parseDateTimeBestEffort('${todayStr}')
    `,
    format: 'JSONEachRow'
  });
  let todayVisitorsCount = 0;
  for await (const row of todayVisRes.stream()) {
    todayVisitorsCount = row.cnt;
  }

  // 3) 신규 사용자 수 (처음 기록된 user_id가 오늘 이후)
  const newUsersRes = await clickhouse.query({
    query: `
      SELECT count() AS newUsers
      FROM (
        SELECT user_id, min(timestamp) AS firstSeen
        FROM ${process.env.CLICKHOUSE_TABLE}
        GROUP BY user_id
      )
      WHERE firstSeen >= parseDateTimeBestEffort('${todayStr}')
    `,
    format: 'JSONEachRow'
  });
  let newUsers = 0;
  for await (const row of newUsersRes.stream()) {
    newUsers = row.newUsers;
  }

  // 4) 재방문자 수 = 오늘 방문자 - 신규 사용자
  const revisitCount = todayVisitorsCount - newUsers;

  // 5) 디바이스 비율
  const devicesRes = await clickhouse.query({
    query: `
      SELECT
        device_type AS device,
        countDistinct(client_id) AS users
      FROM ${process.env.CLICKHOUSE_TABLE}
      GROUP BY device_type
    `,
    format: 'JSONEachRow'
  });
  const devicesRaw = [];
  for await (const row of devicesRes.stream()) {
    devicesRaw.push(row);
  }
  const totalDeviceUsers = devicesRaw.reduce((sum, d) => sum + d.users, 0);
  const devices = devicesRaw.map(d => ({
    device: d.device,
    users: d.users,
    percentage: +((d.users / totalDeviceUsers) * 100).toFixed(1)
  }));

  // 6) 이탈 페이지
  const exitRes = await clickhouse.query({
    query: `
      SELECT
        page,
        count() AS exitCount
      FROM (
        SELECT
          client_id,
          argMax(page_path, timestamp) AS page
        FROM ${process.env.CLICKHOUSE_TABLE}
        GROUP BY client_id
      )
      GROUP BY page
    `,
    format: 'JSONEachRow'
  });
  const exitRaw = [];
  for await (const row of exitRes.stream()) {
    exitRaw.push(row);
  }
  const exitPages = exitRaw.map(e => ({
    page: e.page,
    exitCount: e.exitCount,
    percentage: +((e.exitCount / todayVisitorsCount) * 100).toFixed(1)
  }));

  // 7) 페이지 체류 시간
  const pageTimesRes = await clickhouse.query({
    query: `
      SELECT
        page_path AS page,
        avg(time_on_page_seconds) AS averageTime,
        count() AS visitCount
      FROM ${process.env.CLICKHOUSE_TABLE}
      WHERE time_on_page_seconds IS NOT NULL
      GROUP BY page_path
    `,
    format: 'JSONEachRow'
  });
  const pageTimes = [];
  for await (const row of pageTimesRes.stream()) {
    pageTimes.push({
      page: row.page,
      averageTime: +row.averageTime,
      visitCount: row.visitCount
    });
  }

  // 8) 최근 7일 방문자 추이
  const trendRes = await clickhouse.query({
    query: `
      SELECT
        formatDateTime(timestamp, '%Y-%m-%d') AS date,
        countDistinct(client_id) AS visitors
      FROM ${process.env.CLICKHOUSE_TABLE}
      WHERE timestamp >= parseDateTimeBestEffort('${sevenDaysAgoStr}')
      GROUP BY date
      ORDER BY date
    `,
    format: 'JSONEachRow'
  });
  const visitorTrendRaw = [];
  for await (const row of trendRes.stream()) {
    visitorTrendRaw.push(row);
  }
  // 누락된 날짜 보완, newVisitors 및 returningVisitors는 0으로
  const visitorTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayKst.getTime() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const found = visitorTrendRaw.find(v => v.date === dateStr);
    visitorTrend.push({
      date: dateStr,
      visitors: found?.visitors || 0,
      newVisitors: 0,
      returningVisitors: 0
    });
  }

  // 9) 최종 통계 객체 반환
  const stats = [
    {
      title: "일일 방문자",
      value: todayVisitorsCount,
      change: 0,
      changeType: "neutral",
      icon: "Users",
      color: "blue"
    },
    {
      title: "신규 사용자",
      value: newUsers,
      change: 0,
      changeType: "neutral",
      icon: "UserPlus",
      color: "green"
    },
    {
      title: "재방문자",
      value: revisitCount,
      change: 0,
      changeType: "neutral",
      icon: "UserCheck",
      color: "purple"
    }
  ];

  return {
    stats,
    visitorTrend,
    exitPages,
    pageTimes,
    devices
  };
}

module.exports = { getDashboardData };
