require("dotenv").config();
const redis = require("./redis");
// const AWS = require("aws-sdk");

const isUsingRedis = process.env.QUEUE_TYPE !== "sqs"; // 실제 배포 시에는 false가 되어야 함

async function enqueueAnalytics(data) {
  const payload = JSON.stringify(data);

  if (isUsingRedis) {
    return redis.lpush("analytics_queue", payload);
  } else {
    // TODO: SQS 환경 셋업(예: prod)
    /*
    const sqs = new AWS.SQS({ region: "ap-northeast-2" });
    const params = {
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: payload
    };
    return sqs.sendMessage(params).promise();
    */
    throw new Error("SQS enqueueAnalytics() not implemented yet.");
  }
}

async function dequeueAnalytics() {
  if (isUsingRedis) {
    const raw = await redis.rpop("analytics_queue");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Redis 큐 JSON 파싱 오류:", e);
      return null;
    }
  } else {
    // TODO: 실제 SQS receiveMessage 처리
    /*
    const sqs = new AWS.SQS({ region: "ap-northeast-2" });
    const params = {
      QueueUrl: process.env.SQS_QUEUE_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 1
    };
    const result = await sqs.receiveMessage(params).promise();
    const msg = result.Messages?.[0];
    if (!msg) return null;

    const data = JSON.parse(msg.Body);
    await sqs.deleteMessage({
      QueueUrl: process.env.SQS_QUEUE_URL,
      ReceiptHandle: msg.ReceiptHandle
    }).promise();

    return data;
    */
    throw new Error("SQS dequeueAnalytics() not implemented yet.");
  }
}

module.exports = { enqueueAnalytics, dequeueAnalytics };
