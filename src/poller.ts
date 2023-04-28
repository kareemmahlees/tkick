import EventEmitter from "events";
import { TkickQueueManager } from "./interfaces";
import { RedisClient } from "./types";
import { tkickEventEmitter } from "./eventEmitter";
import TkickRedisQueueManager from "./queue";
import Job from "./job";

/**
 * Poller is responsible for continuously checking if
 * a scheduled job's time is up.
 * It has a single method
 */
export default class TkickPoller {
    eventEmitter: EventEmitter;
    queue: TkickQueueManager;
    constructor(redisClient: RedisClient) {
        this.eventEmitter = tkickEventEmitter;
        this.queue = new TkickRedisQueueManager(redisClient);
    }

    async poll() {
        setInterval(async () => {
            const scheduledJobs = await this.queue.getScheduledJobs();
            scheduledJobs.forEach((job) => {
                const jobObj: Job = JSON.parse(job);

                const now = new Date(Date.now()).setMilliseconds(0);
                const scheduleTime = new Date(
                    jobObj.scheduledTime as number
                ).setMilliseconds(0);

                if (now === scheduleTime) {
                    this.eventEmitter.emit("job:scheduleUp", job);
                }
            });
        }, 1000);
    }
}
