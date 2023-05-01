import { v4 as uuidv4 } from "uuid";
import type { LoadBalancerState, RedisClient } from "./types";
import type { EventEmitter } from "events";
import { tkickEventEmitter } from "./eventEmitter";
import { error } from "./logging";
import TkickWorker from "./worker";

/**
 * LoadBalancer responsible for responding to events emitted from
 * queued/scheduled jobs and diverge requests to the **Free** workers
 */
export default class LoadBalancer {
    workersNum: number;
    state: LoadBalancerState[] = [];
    eventEmitter: EventEmitter;
    constructor(workersNum: number, redisClient: RedisClient) {
        this.workersNum = workersNum;
        this.eventEmitter = tkickEventEmitter;
        this.createWorkers(redisClient);
    }

    registerListeners(): void {
        this.eventEmitter.on("job:created", async (queueName) => {
            const freeWorker = this.getFreeWorker();
            if (!freeWorker) {
                error("no free workers, waiting");
                return;
            }
            this.switchWorkerState(freeWorker.id); // switch to busy
            await freeWorker.worker.executeQueuedJob(queueName);
            this.switchWorkerState(freeWorker.id); // switch to free
        });
        this.eventEmitter.on("job:scheduleUp", async (job) => {
            const freeWorker = this.getFreeWorker();
            if (!freeWorker) {
                error("no free workers, waiting");
                return;
            }
            this.switchWorkerState(freeWorker.id); // switch to busy
            await freeWorker.worker.executeScheduledJob(job);
            this.switchWorkerState(freeWorker.id); // switch to free
        });
    }

    createWorkers(redisClient: RedisClient): void {
        for (let i = 0; i < this.workersNum; i++) {
            this.state.push({
                id: uuidv4(),
                worker: new TkickWorker(redisClient),
                isBusy: false,
            });
        }
    }

    getFreeWorker(): LoadBalancerState | null {
        const freeWorkers = this.state.filter(
            (workerState: LoadBalancerState) => !workerState.isBusy
        );
        return freeWorkers.length > 0
            ? freeWorkers[Math.floor(Math.random() * freeWorkers.length)]
            : null;
    }

    switchWorkerState(id: string): void {
        this.state.forEach((state, idx) => {
            if (state.id === id) {
                const busyState = this.state[idx].isBusy;
                this.state[idx].isBusy = !busyState;
            }
        });
    }
}
