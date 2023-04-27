import Job from "./job";

export declare interface TkickClient {
    enqueueAt(queueName: string, job: Job): void;
    schedule(job: Job, scheduleTimeInSeconds: number): void;
}

export declare interface TkickQueueManager {
    enqueue(queueName: string, job: Job): void;
    deque(queueName: string): Promise<Job | void>;
    schedule(job: Job, scheduleTimeInSeconds: number): void;
    deSchedule(job: string): void;
    getScheduledJobs(): Promise<string[]>;
}

export declare interface ITkickWorker {
    executeQueuedJob(queueName: string): void;
    dequeFrom(queueName: string): void;
}
