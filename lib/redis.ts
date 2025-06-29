import { Redis } from "ioredis";
import { confidentialEnv } from "./env";

declare global {
  var redis: Redis | undefined;
}

let redis: Redis;

if (process.env.NODE_ENV === "production") {
  redis = new Redis(confidentialEnv.REDIS_URL, {
    password: confidentialEnv.REDIS_PASSWORD,
  });
} else {
  if (!global.redis) {
    global.redis = new Redis(confidentialEnv.REDIS_URL, {
      password: confidentialEnv.REDIS_PASSWORD,
    });

    // Optional: Add error logging for development
    global.redis.on("error", (err) => console.error("Redis Client Error", err));
    global.redis.on("connect", () => console.log("Redis Client Connected"));
  }
  redis = global.redis;
}

export const redisClient = redis;
