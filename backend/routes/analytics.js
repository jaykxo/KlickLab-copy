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

    const {
      event_name,
      client_id,
      user_id,
      session_id,
      user_gender = null,
      user_age = null,
      properties = {},
      context = {}
    } = data;

    const {
      page_path,
      page_title,
      referrer,
      time_on_page_seconds = null,
      ...restProperties
    } = properties;

    const {
      device = {},
      traffic_source = {},
      ...restContext
    } = context;

    const {
      device_type = null,
      os = null,
      browser = null,
      language = null,
      ...restDevice
    } = device;

    const {
      traffic_medium = null,
      traffic_source: trafficSourceName = null,
      campaign = null,
      ...restTraffic
    } = traffic_source;

    const filteredContext = {
      ...restContext,
      ...(Object.keys(restDevice).length > 0 && { device: restDevice }),
      ...(Object.keys(restTraffic).length > 0 && { traffic_source: restTraffic })
    };

    const entry = {
      event_name,
      timestamp: kstDate.toISOString(),
      client_id,
      user_id,
      session_id,

      page_path,
      page_title,
      referrer,
      time_on_page_seconds,

      device_type,
      os,
      browser,
      language,

      traffic_medium,
      traffic_source: trafficSourceName,
      traffic_campaign: campaign,

      user_gender,
      user_age,

      ...(Object.keys(restProperties).length > 0 && { properties: restProperties }),
      ...(Object.keys(filteredContext).length > 0 && { context: filteredContext })
    };

    await logs.insertOne(entry);
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
