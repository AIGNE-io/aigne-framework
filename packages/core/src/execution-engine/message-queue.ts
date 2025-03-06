import { EventEmitter } from "node:events";

export const UserInput = "UserInput";

export const UserOutput = "UserOutput";

export class MessageQueue extends EventEmitter {}
