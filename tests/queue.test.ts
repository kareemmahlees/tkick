import { createClient } from "redis";
import TkickRedisQueueManager from "../src/queue";
import Job from "../src/job";
import type { RedisClient } from "../src/types";
import type { TkickQueueManager } from "../src/interfaces";

let redisClient: RedisClient;
let queue: TkickQueueManager;
let job: Job;
let redisQueue: string;

beforeAll(async () => {
    redisClient = createClient({
        socket: {
            host: "localhost",
            port: 63791,
        },
    });
    queue = new TkickRedisQueueManager(redisClient);
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

describe("Queue functionality", () => {
    test("should enqueue job and increase length of queue", async () => {
        queue.enqueue(redisQueue, job);
        queue.enqueue(redisQueue, job);
        queue.enqueue(redisQueue, job);
        const queueLength = await redisClient.lLen(redisQueue);
        expect(queueLength).toBe(3);
    });

    test("should dequeue job that matches the enqueued job", async () => {
        type DequeuedJob = {
            id: string;
            name: string;
            queue?: string;
            jobFunction: string;
        };
        queue.enqueue(redisQueue, job);
        const dequedJob = await queue.deque(redisQueue);
        expect(dequedJob).toMatchObject<DequeuedJob>({
            ...job,
            jobFunction: job.jobFunction.toString(),
        });
    });
});
