import { Server } from "http";
import type { RedisClient } from "./types";
import TkickPoller from "./poller";
import LoadBalancer from "./loadBalancer";

/**
 * Sets up the workers and poller
 * @param redisClient redis connection client
 * @returns An instance of `http.Server`
 */
export const TkickServer = async function (
    redisClient: RedisClient
): Promise<Server> {
    // const worker = new TkickWorker(redisClient);
    const poller = new TkickPoller(redisClient);
    const loadBalancer = new LoadBalancer(3, redisClient);
    // worker.registerListener();
    loadBalancer.registerListeners();
    await poller.poll();
    return new Server();
};
