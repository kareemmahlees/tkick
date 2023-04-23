import { TkickQueueManager } from "./interfaces";
import { RedisClient } from "./types";
import Job from "./job";
import { error, info } from "./logging";

export default class TkickRedisQueueManager implements TkickQueueManager {
    redisClient: RedisClient;
    constructor(redisClient: RedisClient) {
        this.redisClient = redisClient;
    }

    async enqueue(queueName: string, job: Job): Promise<void> {
        job.queue = queueName;
        const jobDefinition = {
            ...job,
            jobFunction: job.jobFunction.toString(), // this line is to convert thefunction definition into a string representation
        };
        await this.redisClient.LPUSH(queueName, JSON.stringify(jobDefinition));
        info(`"${job.name}" queued`);
        return;
    }
    async deque(queueName: string): Promise<Job | void> {
        const queuedJob = await this.redisClient.RPOP(queueName);
        if (queuedJob) {
            return JSON.parse(queuedJob);
        }
        error(`Can't find queue with name ${queueName}`);
        return;
    }
}
