import { Server } from "http";
import TkickWorker from "./worker";
import { RedisClient } from "./types";
import { info } from "./logging";

export const TkickServer = function (redisClient: RedisClient): Server {
    const worker = new TkickWorker(redisClient);
    worker.registerListener();
    return new Server();
};
