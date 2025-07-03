require("dotenv").config();
const redis = require("./redis");
const AWS = require("aws-sdk");

const isUsingRedis = process.env.QUEUE_TYPE !== "sqs"; // 실제 배포 시에는 false가 되어야 함

async function enqueueAnalytics(data) {
  const payload = JSON.stringify(data);

  if (isUsingRedis) {
    return redis.lpush("analytics_queue", payload);
  } else {
    const sqs = new AWS.SQS({ region: "ap-northeast-2" });
    const params = {
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: payload
    };
    return sqs.sendMessage(params).promise();
  }
}

async function consumeAnalytics(callback) {
  if (isUsingRedis) {
    while (true) {
      try {
        const result = await redis.brpop('analytics_queue', 0);
        const raw = result?.[1];
        if (!raw) continue;

        const data = JSON.parse(raw);
        await callback(data);
      } catch (e) {
        console.error('[Redis] BRPOP error:', e);
      }
    }
  } else {
    const sqs = new AWS.SQS({ region: 'ap-northeast-2' });
    const QueueUrl = process.env.SQS_QUEUE_URL;

    while (true) {
      try {
        const res = await sqs.receiveMessage({
          QueueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 10, // long poll
        }).promise();

        const messages = res.Messages || [];
        for (const msg of messages) {
          const data = JSON.parse(msg.Body);
          await callback(data);

          await sqs.deleteMessage({
            QueueUrl,
            ReceiptHandle: msg.ReceiptHandle,
          }).promise();
        }
      } catch (e) {
        console.error('[SQS] receiveMessage error:', e);
      }
    }
  }
}

module.exports = { enqueueAnalytics, consumeAnalytics };