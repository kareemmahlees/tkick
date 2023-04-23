import { createClient } from "redis";
import Job from "../src/job";
import { RedisClient } from "../src/types";
import TkickWorker from "../src/worker";
import { tkickEventEmitter } from "../src/eventEmitter";
import { TkickClient } from "../src/interfaces";
import TkickRedisClient from "../src/client";

let redisClient: RedisClient;
let job: Job;
let tkickClient: TkickClient;
let worker: TkickWorker;
let redisQueue: string;

beforeAll(async () => {
    redisClient = createClient({
        socket: {
            host: "localhost",
            port: 63791,
        },
    });

    job = new Job("foo", () => {
        return 1 + 1;
    });

    redisQueue = "queue1";

    worker = new TkickWorker(redisClient);

    tkickClient = new TkickRedisClient(redisClient);

    redisClient.on("error", (err) => console.log("Redis Client Error", err));
    await redisClient.connect();
});

afterEach(async () => {
    await redisClient.del(redisQueue);
});

afterAll(async () => {
    await redisClient.quit();
});

describe("Worker functionality", () => {
    test("should regsiter event listener", () => {
        worker.registerListener();
        const listenersCount = tkickEventEmitter.listenerCount("job:created");
        expect(listenersCount).toBe(1);
    });
});
