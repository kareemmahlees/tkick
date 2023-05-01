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

async function main(): Promise<void> {
    // connect the redis client
    redisClient.on("error", (err) => {
        console.log("Redis Client Error", err);
    });
    await redisClient.connect();

    // start the server
    const server = await TkickServer(redisClient);
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
    await client.enqueueAt("foo", firstJob);
    await client.enqueueAt("bar", secondJob);
    await client.enqueueAt("baz", thirdJob);

    // schedule it
    await client.schedule(firstJob, 5);
    await client.schedule(secondJob, 5);
    await client.schedule(thirdJob, 5);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
