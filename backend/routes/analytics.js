const express = require("express");
const router = express.Router();
const { getDashboardData } = require("../services/getDashboardData");

// 더 이상 Express 서버는 클릭스트림 수집에 관여하지 않음

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
