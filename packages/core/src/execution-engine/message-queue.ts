import { EventEmitter } from "node:events";

export const UserInputTopic = "UserInputTopic";

export const UserOutputTopic = "UserOutputTopic";

export class MessageQueue extends EventEmitter {}
