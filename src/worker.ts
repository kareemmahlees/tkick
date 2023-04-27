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
            this.executeQueuedJob(queueName);
        });
        this.eventEmitter.addListener("job:scheduleUp", (job) => {
            this.executeScheduledJob(job);
        });
    }

    async executeQueuedJob(queueName: string): Promise<void | any> {
        const job = await this.dequeFrom(queueName);
        if (job) {
            const result = await this.executeJob(job);
            success(`Job "${job.name}" completed with result (${result})`);
        } else {
            error("Error when dequeuing job");
        }
    }

    async executeScheduledJob(job: string) {
        await this.removeJobFromSchedule(job);
        const jobObj: Job = JSON.parse(job);
        const result = await this.executeJob(jobObj);
        const scheduleTime = new Date(
            jobObj.scheduledTime as number
        ).toUTCString();
        success(
            `Job ${jobObj.name}, scheduled at ${scheduleTime}, completed with result (${result})`
        );
    }

    async executeJob(job: Job) {
        const functionDefinition = new Function("return " + job.jobFunction)();
        const functionExecutionReturn = functionDefinition();
        return functionExecutionReturn;
    }

    async dequeFrom(queueName: string): Promise<Job | void> {
        return await this.queue.deque(queueName);
    }

    async removeJobFromSchedule(job: string) {
        return this.queue.deSchedule(job);
    }
}
