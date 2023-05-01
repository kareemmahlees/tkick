import type { createClient } from "redis";
import type TkickWorker from "./worker";

export type RedisClient = ReturnType<typeof createClient>;

export type LoadBalancerState = {
    id: string;
    worker: TkickWorker;
    isBusy: boolean;
};
