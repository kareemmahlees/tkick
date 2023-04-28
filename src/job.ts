import { v4 as uuidv4 } from "uuid";

/**
 * A class that holds the information of the job to enqueue/schedule
 * with the client
 */
export default class Job {
    id: string;
    name: string;
    queue?: string;
    scheduledTime?: number;
    jobFunction: CallableFunction;
    constructor(name: string, jobFunction: CallableFunction) {
        this.id = uuidv4();
        this.name = name;
        this.jobFunction = jobFunction;
    }
}
