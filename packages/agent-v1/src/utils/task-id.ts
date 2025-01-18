import { Worker } from "snowflake-uuid";

const idGenerator = new Worker();

export const nextId = () => idGenerator.nextId().toString();
