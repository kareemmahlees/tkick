import type EventEmitter from "events";
import { tkickEventEmitter } from "./eventEmitter";
import type { TkickQueueManager, ITkickWorker } from "./interfaces";
import type Job from "./job";
import TkickRedisQueueManager from "./queue";
import type { RedisClient } from "./types";
import { error, success } from "./logging";

/**
 * A Worker is responsible for executing the enqueued/scheduled jobs
 * @implements ITkickWorker
 */
export default class TkickWorker implements ITkickWorker {
    eventEmitter: EventEmitter;
    queue: TkickQueueManager;
    constructor(redisClient: RedisClient) {
        this.eventEmitter = tkickEventEmitter;
        this.queue = new TkickRedisQueueManager(redisClient);
    }

    async executeQueuedJob(queueName: string): Promise<undefined | any> {
        const job = await this.dequeFrom(queueName);
        if (job) {
            const result = await this.executeJob(job);
            success(`Job "${job.name}" completed with result (${result})`);
        } else {
            error("Error when dequeuing job");
        }
    }

    async executeScheduledJob(job: string): Promise<void> {
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

    async executeJob(job: Job): Promise<any> {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        const functionDefinition = new Function("return " + job.jobFunction)();
        const functionExecutionReturn = functionDefinition();
        return functionExecutionReturn;
    }

    async dequeFrom(queueName: string): Promise<Job | undefined> {
        return await this.queue.deque(queueName);
    }

    async removeJobFromSchedule(job: string): Promise<number> {
        return await this.queue.deSchedule(job);
    }
}
