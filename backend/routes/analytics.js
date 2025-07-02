const express = require("express");
const router = express.Router();
const connectMongo = require("../src/config/mongo");
const { getDashboardData } = require("../services/getDashboardData");

/* SDK로부터 받은 데이터를 DB에 저장 */
router.post("/collect", async (req, res) => {
  const data = req.body;

  try {
    const db = await connectMongo();
    const logs = db.collection("logs");

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
      traffic_medium:
        data.context?.traffic_source?.traffic_medium ?? null,
      traffic_source:
        data.context?.traffic_source?.traffic_source ?? null,
      traffic_campaign: data.context?.traffic_source?.campaign ?? null,

      // flatten user meta
      user_gender: data.user_gender,
      user_age: data.user_age,

      // 원본도 같이 저장 (optional)
      properties: data.properties,
      context: data.context,
    });

    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("MongoDB INSERT ERROR:", err);
    res.status(500).json({ error: "MongoDB insert failed" });
  }
});

router.post("/getDashboardData", async (req, res) => {
  try {
    const data = await getDashboardData();
    res.status(200).json(data);
  } catch (error) {
    console.error("대시보드 데이터 오류:", error);
    res.status(500).json({ error: "대시보드 데이터를 불러오는 데 실패했습니다." });
  }
});

module.exports = router;
