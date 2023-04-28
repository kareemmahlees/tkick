import { TkickClient, TkickQueueManager } from "./interfaces";
import { tkickEventEmitter } from "./eventEmitter";
import EventEmitter from "events";
import Job from "./job";
import TkickRedisQueueManager from "./queue";
import { RedisClient } from "./types";

/**
 * The Client is an abstraction on top of the Queue object
 * it basically handles all the execution to the Queue
 * but it provides a nicer interface on top of it
 * @implements TkickClient
 */
export default class TkickRedisClient implements TkickClient {
    queue: TkickQueueManager;
    eventEmitter: EventEmitter;
    constructor(redisClient: RedisClient) {
        this.queue = new TkickRedisQueueManager(redisClient);
        this.eventEmitter = tkickEventEmitter;
    }

    async enqueueAt(queueName: string, job: Job): Promise<void> {
        this.queue.enqueue(queueName, job);
        this.eventEmitter.emit("job:created", queueName);
    }

    async schedule(job: Job, scheduleTimeInSeconds: number): Promise<void> {
        this.queue.schedule(job, scheduleTimeInSeconds);
    }
}
