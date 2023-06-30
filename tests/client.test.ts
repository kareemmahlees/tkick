import { createClient } from "redis";
import Job from "../src/job";
import type { RedisClient } from "../src/types";
import type { TkickClient } from "../src/interfaces";
import TkickRedisClient from "../src/client";
import { beforeAll, afterEach, afterAll, describe, it, expect } from "vitest";

let redisClient: RedisClient;
let tkickClient: TkickClient;
let job: Job;
let redisQueue: string;

beforeAll(async () => {
    redisClient = createClient({
        socket: {
            host: "localhost",
            port: 63791,
        },
    });
    tkickClient = new TkickRedisClient(redisClient);
    job = new Job("foo", () => {
        return 1 + 1;
    });
    redisQueue = "queue";

    redisClient.on("error", (err) => {
        console.log("Redis Client Error", err);
    });
    await redisClient.connect();
});

afterEach(async () => {
    await redisClient.del(redisQueue);
});

afterAll(async () => {
    await redisClient.quit();
});

describe("Client functionality", () => {
    it("should enqueue job", async () => {
        tkickClient.enqueueAt(redisQueue, job);
        tkickClient.enqueueAt(redisQueue, job);
        tkickClient.enqueueAt(redisQueue, job);
        const queueLength = await redisClient.lLen(redisQueue);
        expect(queueLength).toBe(3);
    });
});
