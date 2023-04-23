import EventEmitter from "events";
import { tkickEventEmitter } from "./eventEmitter";
import { TkickQueueManager, ITkickWorker } from "./interfaces";
import Job from "./job";
import TkickRedisQueueManager from "./queue";
import { RedisClient } from "./types";
import { error, success } from "./logging";

export default class TkickWorker implements ITkickWorker {
    eventEmitter: EventEmitter;
    queue: TkickQueueManager;
    constructor(redisClient: RedisClient) {
        this.eventEmitter = tkickEventEmitter;
        this.queue = new TkickRedisQueueManager(redisClient);
    }

    registerListener() {
        this.eventEmitter.addListener("job:created", (queueName) => {
            this.executeJob(queueName);
        });
    }

    async executeJob(queueName: string): Promise<void | any> {
        const job = await this.dequeFrom(queueName);
        if (job) {
            const { name, jobFunction } = job;

            const functionDefinition = new Function("return " + jobFunction)();
            const functionExecutionReturn = functionDefinition();
            success(
                `Job "${name}" completed with result (${functionExecutionReturn})`
            );
            return functionExecutionReturn;
        } else {
            error("Error when dequeuing job");
        }
    }

    async dequeFrom(queueName: string): Promise<Job | void> {
        return await this.queue.deque(queueName);
    }
}
