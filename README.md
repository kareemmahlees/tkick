# <span class="title">**_<span class="blue">t</span>Kick_**</span>

The next ground-breaking, earth-shaking, revolutionary background job system.

<div class="badges">
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">

<img src = "https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white">

<img src="https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white">
<img src="https://img.shields.io/badge/Jest-323330?style=for-the-badge&logo=Jest&logoColor=white">

<img src="https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E">

<img src="https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white">

<img src="https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white">
</div>

# How it works

before we jump into how **tKick** works we first need to explore so terminology so we can grasp a better understanding of the topic:

| Term          | Definition                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Job           | An object that stores information about the the function you want to store ( id,name,queue,job function definition)                                                       |
| Queue         | Like any queue in the real world, it's a line of objects that are waiting to be served, typically a queue have an `enqueue` and a `dequeue` method                        |
| Worker        | An object that is responsible for executing queued and scheduled tasks                                                                                                    |
| Load Balancer | It is the portal that orchestrates the interaction between the Poller,QueueManager and the Workers,it is also responsible for load balancing the work between the workers |
| Poller        | An object that is continuously polling the database and checking whether a scheduled job time is up or not                                                                |
| Client        | The interface through which you can interact with the system, it encapsulates some low level functionality                                                                |

With that out of the way, let's now explore how **tKick** works.

![illustration](./docs/load_balancer_update.png)

### Queueing

-   When you ask the client to enqueue a job, it sends a request to the underlying queue manager with the provided job.
-   The Queue Manger sends a request for the redis client to enqueue the job in redis queue.
-   An event is emitted carrying some information about the job.

### Scheduling

-   When you ask the client to schedule a job, it send a request to the underlying Queue Manager with the provided job
-   the Queue Manager enqueues the job in a specific redis queue for scheduled jobs
-   The Poller is continuously polling redis to check if a job's execution time is up, if true then and event is emitted with the job.

The Missing piece in previous two operations is executing the jobs, this is the responsibility of the event emitter, it has subscribed for both queueing and scheduling events and delegates the work to any of the **Free** workers.

It also tracks the state of each worker and depending on whether it is busy or not, it decides either to give the job to the worker or hand it to another worker.

Interfaces are used extensively here to allow using other queues or data storages such as PostgreSQL or MySQL.

# Trying the App

In the `examples/` folder you will find an example file explaining the basic usage of **tKick**.

If you wish to run the example, run the `dev` script:

```console
$ npm run dev
```

**Please Note** that this command will pull the redis docker image if not exists

# Running Tests

If you wish to run the tests for development purposes, you can run the `test` script:

```console
$ npm test
```

# The intent of the project

This project is primarily inspired by a [challenge]("https://www.codementor.io/projects/tool/background-job-system-atx32exogo") on the [devProjects]("https://www.codementor.io/projects") website.

Most of the solutions were submitted in golang so i thought it would be a good challenge to try a solution in Typescript and Nodejs.

# What does **tKick** mean?

The original author of the project, [Ben Yeh](https://github.com/ocowchun) has named his implementation _**Kick**_ ,So following the footsteps of _**RPC**_ and _**tRPC**_, I decided to name my implementation in Typescript _**tKick**_ 👀.

# Todo

-   [x] Implement a multi workers system

-   [x] Add scheduling jobs

<!-- <style>
    img{
        border-radius:1rem;
    }
    .badges{
        display:flex;
        flex-wrap:wrap;
        gap:0.5rem;
        margin:1rem 0
    }
    .title{
        display:flex;
        justify-content:center;
        font-size:50px;
    }
    .blue{
        color:#0563a6;
    }
</style> -->
