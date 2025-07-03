const express = require("express");
const router = express.Router();
const { enqueueAnalytics } = require("../src/config/queue");
const { getDashboardData } = require("../services/getDashboardData");

/* SDK로부터 받은 데이터를 DB에 저장 */
router.post("/collect", async (req, res) => {
  const data = req.body;

  try {
    await enqueueAnalytics(data);
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
