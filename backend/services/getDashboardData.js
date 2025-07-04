const clickhouse = require('../src/config/clickhouse');

async function getDashboardData() {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const todayKst = new Date(now.getTime() + kstOffset);
  todayKst.setHours(0, 0, 0, 0);
  const todayStr = new Date(todayKst.getTime() - kstOffset).toISOString().slice(0, 19).replace('T', ' ');

  const sevenDaysAgoKst = new Date(todayKst);
  sevenDaysAgoKst.setDate(sevenDaysAgoKst.getDate() - 6);
  const sevenDaysAgoStr = new Date(sevenDaysAgoKst.getTime() - kstOffset).toISOString().slice(0, 19).replace('T', ' ');

  // 통합 쿼리
  const rawRes = await clickhouse.query({
    query: `
      SELECT
        client_id,
        user_id,
        user_gender,
        user_age,
        device_type,
        page_path,
        time_on_page_seconds,
        timestamp,
        argMax(page_path, timestamp) OVER (PARTITION BY client_id) AS last_page
      FROM ${process.env.CLICKHOUSE_TABLE}
      WHERE timestamp >= '${todayStr}'
    `,
    format: 'JSONEachRow'
  });
  const rawData = await rawRes.json();

  // 방문자 수
  const uniqueClients = new Set();
  rawData.forEach(row => uniqueClients.add(row.client_id));
  const todayVisitorsCount = uniqueClients.size;

  // 신규 사용자 수
  const firstSeenMap = new Map();
  rawData.forEach(row => {
    const prev = firstSeenMap.get(row.user_id);
    if (!prev || new Date(row.timestamp) < new Date(prev)) {
      firstSeenMap.set(row.user_id, row.timestamp);
    }
  });
  const newUsers = Array.from(firstSeenMap.values()).filter(t => t >= todayStr).length;
  const revisitCount = todayVisitorsCount - newUsers;

  // 디바이스 비율
  const deviceMap = new Map();
  rawData.forEach(row => {
    const device = row.device_type || 'unknown';
    if (!deviceMap.has(device)) deviceMap.set(device, new Set());
    deviceMap.get(device).add(row.client_id);
  });
  const devices = Array.from(deviceMap.entries()).map(([device, set]) => ({
    device,
    users: set.size
  }));
  const totalDeviceUsers = devices.reduce((sum, d) => sum + d.users, 0);
  devices.forEach(d => {
    d.percentage = +((d.users / totalDeviceUsers) * 100).toFixed(1);
  });

  // 이탈 페이지
  const exitPageMap = new Map();
  rawData.forEach(row => {
    if (!row.last_page) return;
    exitPageMap.set(row.last_page, (exitPageMap.get(row.last_page) || 0) + 1);
  });
  const exitPages = Array.from(exitPageMap.entries()).map(([page, exitCount]) => ({
    page,
    exitCount,
    percentage: +((exitCount / todayVisitorsCount) * 100).toFixed(1)
  }));

  // 페이지 체류 시간
  const pageTimeMap = new Map();
  rawData.forEach(row => {
    const page = row.page_path;
    const time = row.time_on_page_seconds;
    if (!page || time === null || time === undefined) return;
    if (!pageTimeMap.has(page)) {
      pageTimeMap.set(page, { totalTime: 0, count: 0 });
    }
    const entry = pageTimeMap.get(page);
    entry.totalTime += +time;
    entry.count += 1;
  });
  const pageTimes = Array.from(pageTimeMap.entries()).map(([page, { totalTime, count }]) => ({
    page,
    averageTime: +(totalTime / count).toFixed(1),
    visitCount: count
  }));

  // 방문자 추이 (여기만 별도 쿼리 유지)
  const trendRes = await clickhouse.query({
    query: `
      SELECT
        formatDateTime(timestamp, '%Y-%m-%d') AS date,
        countDistinct(client_id) AS visitors,
        countDistinctIf(client_id, isNew = 1) AS newVisitors,
        countDistinctIf(client_id, isNew = 0) AS returningVisitors
      FROM (
        SELECT
          client_id,
          timestamp,
          formatDateTime(timestamp, '%Y-%m-%d') AS current_date,
          formatDateTime(min_timestamp, '%Y-%m-%d') AS first_date,
          if(current_date = first_date, 1, 0) AS isNew
        FROM (
          SELECT
            client_id,
            timestamp,
            min(timestamp) OVER (PARTITION BY client_id) AS min_timestamp
          FROM ${process.env.CLICKHOUSE_TABLE}
          WHERE timestamp >= '${sevenDaysAgoStr}'
        )
      )
      GROUP BY date
      ORDER BY date
    `,
    format: 'JSONEachRow'
  });
  const visitorTrendRaw = await trendRes.json();

  const baseDate = new Date(now);
  const visitorTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate.getTime() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const found = visitorTrendRaw.find(v => v.date === dateStr);
    visitorTrend.push({
      date: dateStr,
      visitors: +found?.visitors || 0,
      newVisitors: +found?.newVisitors || 0,
      returningVisitors: +found?.returningVisitors || 0
    });
  }

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
