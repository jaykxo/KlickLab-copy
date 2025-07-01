const connectMongo = require("../src/config/mongo");

async function getDashboardData() {
  const db = await connectMongo();
  const logs = db.collection("logs");

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(Date.now() - 6 * 86400000);

  // 1. 오늘 방문자 수 (고유 client_id 기준)
  const todayVisitors = await logs.distinct("client_id", {
    $expr: {
      $gte: [
        { $dateFromString: { dateString: "$timestamp" } },
        today
      ]
    }
  });

  // 2. 신규 사용자 수 (오늘 처음 기록된 user_id)
  const newUsersAgg = await logs.aggregate([
    {
      $match: {
        $expr: {
          $gte: [
            { $dateFromString: { dateString: "$timestamp" } },
            today
          ]
        }
      }
    },
    { $group: { _id: "$user_id" } },
    { $count: "newUsers" }
  ]).toArray();
  const newUsers = newUsersAgg[0]?.newUsers || 0;

  // 3. 재방문자 수: 오늘도 활동했고 과거에도 활동한 user_id
  const revisitsAgg = await logs.aggregate([
    {
      $match: {
        $expr: {
          $gte: [
            { $dateFromString: { dateString: "$timestamp" } },
            today
          ]
        }
      }
    },
    { $group: { _id: "$user_id" } },
    {
      $lookup: {
        from: "logs",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$user_id", "$$userId"] },
                  {
                    $lt: [
                      { $dateFromString: { dateString: "$timestamp" } },
                      today
                    ]
                  }
                ]
              }
            }
          }
        ],
        as: "past"
      }
    },
    { $match: { past: { $ne: [] } } },
    { $count: "revisitCount" }
  ]).toArray();
  const revisitCount = revisitsAgg[0]?.revisitCount || 0;

  // 4. 디바이스 비율
  const deviceAgg = await logs
    .aggregate([
      {
        $group: {
          _id: "$device_type",
          users: { $addToSet: "$client_id" },
        },
      },
      {
        $project: {
          device: "$_id",
          users: { $size: "$users" },
          _id: 0,
        },
      },
    ])
    .toArray();
  const totalDeviceUsers = deviceAgg.reduce((sum, d) => sum + d.users, 0);
  const devices = deviceAgg.map((d) => ({
    ...d,
    percentage: +((d.users / totalDeviceUsers) * 100).toFixed(1),
  }));

  // 5. 이탈 페이지: 마지막 이벤트가 해당 page_path인 client_id 수
  const exitPagesAgg = await logs
    .aggregate([
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: "$client_id",
          page: { $first: "$page_path" },
        },
      },
      {
        $group: {
          _id: "$page",
          exitCount: { $sum: 1 },
        },
      },
      {
        $project: {
          page: "$_id",
          exitCount: 1,
          _id: 0,
        },
      },
    ])
    .toArray();
  const exitPages = exitPagesAgg.map((e) => ({
    ...e,
    percentage: +((e.exitCount / todayVisitors.length) * 100).toFixed(1),
  }));

  // 6. 페이지 체류 시간: time_on_page_seconds 평균
  const pageTimesAgg = await logs
    .aggregate([
      {
        $match: {
          "properties.time_on_page_seconds": { $exists: true },
        },
      },
      {
        $group: {
          _id: "$page_path",
          averageTime: { $avg: "$properties.time_on_page_seconds" },
          visitCount: { $sum: 1 },
        },
      },
    ])
    .toArray();
  const pageTimes = pageTimesAgg.map((p) => ({
    page: p._id,
    averageTime: +p.averageTime.toFixed(1),
    visitCount: p.visitCount,
  }));

  // 7. 최근 7일 방문자 추이
  const visitorTrendRaw = await logs
    .aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$timestamp",
              },
            },
            client: "$client_id",
          },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          visitors: { $sum: 1 },
        },
      },
      {
        $project: {
          date: "$_id",
          visitors: 1,
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ])
    .toArray();

  // 누락된 날짜 보완
  const resultTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().split("T")[0];
    const found = visitorTrendRaw.find((v) => v.date === dateStr);
    resultTrend.push({
      date: dateStr,
      visitors: found?.visitors || 0,
      newVisitors: 0,
      returningVisitors: 0,
    });
  }

  // 최종 응답 객체
  return {
    stats: [
      {
        title: "일일 방문자",
        value: todayVisitors.length,
        change: 12.5,
        changeType: "increase",
        icon: "Users",
        color: "blue",
      },
      {
        title: "신규 사용자",
        value: newUsers,
        change: 8.2,
        changeType: "increase",
        icon: "UserPlus",
        color: "green",
      },
      {
        title: "재방문자",
        value: revisitCount,
        change: -3.1,
        changeType: "decrease",
        icon: "UserCheck",
        color: "purple",
      },
    ],
    visitorTrend: resultTrend,
    exitPages,
    pageTimes,
    devices,
  };
}

module.exports = { getDashboardData };
