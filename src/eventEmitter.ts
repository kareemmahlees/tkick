import { EventEmitter } from "events";

/**
 * An event emitter class that **MUST** be shared between
 * the workers and the client
 * @extends EventEmitter
 */
export class TkickEventEmitter extends EventEmitter {}

export const tkickEventEmitter = new TkickEventEmitter();
