import TkickRedisClient from "../src/client";
import { createClient } from "redis";
import Job from "../src/job";
import { TkickServer } from "../src/server";

const redisClient = createClient({
    socket: {
        host: "localhost",
        port: 63790,
    },
});

async function main() {
    // connect the redis client
    redisClient.on("error", (err) => console.log("Redis Client Error", err));
    await redisClient.connect();

    // start the server
    const server = TkickServer(redisClient);
    server.listen(3001, () => {
        console.log(`TkickServer is listening on port 3001`);
    });

    // create the client
    const client = new TkickRedisClient(redisClient);

    // create a simple job
    const firstJob = new Job("foo", () => {
        return 1 + 1;
    });
    const secondJob = new Job("bar", () => {
        return 1 + 1;
    });
    const thirdJob = new Job("baz", () => {
        return 1 + 1;
    });

    // enqueue it
    client.enqueueAt("foo", firstJob);
    client.enqueueAt("bar", secondJob);
    client.enqueueAt("baz", thirdJob);

    // schedule it
    client.schedule(firstJob, 5);
}

main();
