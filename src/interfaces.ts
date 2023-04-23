import Job from "./job";

export declare interface TkickClient {
    enqueueAt(queueName: string, job: Job): void;
}

export declare interface TkickQueueManager {
    enqueue(name: string, job: Job): void;
    deque(name: string): Promise<Job | void>;
}

export declare interface ITkickWorker {
    executeJob(queueName: string): void;
    dequeFrom(queueName: string): void;
}
