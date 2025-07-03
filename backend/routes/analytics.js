const express = require("express");
const router = express.Router();
// const connectMongo = require("../src/config/mongo");
const redis = require("../src/config/redis");
const { getDashboardData } = require("../services/getDashboardData");

/* SDK로부터 받은 데이터를 DB에 저장 */
router.post("/collect", async (req, res) => {
  const data = req.body;

  // 실제 배포 환경에서는 redis.lpush() 자리에 SQS.sendMessage() 또는 SendMessageBatch()로 바꿀 예정
  try {
    await redis.lpush("analytics_queue", JSON.stringify(data));
    res.status(200).json({ status: "queued" });
  } catch (err) {
    console.error("Redis PUSH ERROR:", err);
    res.status(500).json({ error: "Failed to queue message" });
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
