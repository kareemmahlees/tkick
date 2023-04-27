import { Server } from "http";
import TkickWorker from "./worker";
import { RedisClient } from "./types";
import TkickPoller from "./poller";

export const TkickServer = function (redisClient: RedisClient): Server {
    const worker = new TkickWorker(redisClient);
    const poller = new TkickPoller(redisClient);
    worker.registerListener();
    poller.poll();
    return new Server();
};
