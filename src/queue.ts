import { TkickQueueManager } from "./interfaces";
import { RedisClient } from "./types";
import Job from "./job";
import { error, info } from "./logging";

export default class TkickRedisQueueManager implements TkickQueueManager {
    redisClient: RedisClient;
    schedulingQueue = "scheduledSet";
    constructor(redisClient: RedisClient) {
        this.redisClient = redisClient;
    }

    prepareJobDefinition(
        job: Job,
        queueName?: string,
        scheduleTime?: number
    ): string {
        if (queueName) {
            job.queue = queueName;
        }
        if (scheduleTime) {
            job.scheduledTime = scheduleTime;
        }
        return JSON.stringify({
            ...job,
            jobFunction: job.jobFunction.toString(), // this line is to convert the function definition into a string representation
        });
    }

    async enqueue(queueName: string, job: Job): Promise<void> {
        const jobDefinition = this.prepareJobDefinition(job, queueName);
        await this.redisClient.LPUSH(queueName, jobDefinition);
        info(`"${job.name}" queued`);
        return;
    }

    async deque(queueName: string): Promise<Job | void> {
        const dequedJob = await this.redisClient.RPOP(queueName);
        if (dequedJob) {
            return JSON.parse(dequedJob);
        }
        error(`Can't find queue with name ${queueName}`);
        return;
    }

    async schedule(job: Job, scheduleTimeInSeconds: number): Promise<void> {
        const now = new Date(Date.now());
        const scheduleTime = new Date().setSeconds(
            now.getSeconds() + scheduleTimeInSeconds
        );
        const jobDefinition = this.prepareJobDefinition(
            job,
            undefined,
            scheduleTime
        );
        await this.redisClient.zAdd(this.schedulingQueue, [
            {
                score: scheduleTime,
                value: jobDefinition,
            },
        ]);
        info(`"${job.name}" scheduled`);
    }

    async deSchedule(job: string) {
        const status = await this.redisClient.zRem(this.schedulingQueue, job);
        if (status === 0) {
            error("Error when deScheduling job");
        }
        return status;
    }

    async getScheduledJobs(): Promise<string[]> {
        return await this.redisClient.zRangeByScore(
            this.schedulingQueue,
            "-inf",
            "+inf"
        );
    }
}
