import Redis from "ioredis";
import logger from "./logger";

const redisHost = process.env.REDIS_HOST;
const redisPort = 6379;

const redis = new Redis({
  host: redisHost,
  port: redisPort,
  db: 0,
});

redis.on("connect", () => logger.info(`Redis connected at: ${redis}`));
redis.on("error", (err) => logger.error(`Redis connection error: ${err}`));

export default redis;
