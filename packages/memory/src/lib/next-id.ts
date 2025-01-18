import { Worker } from "snowflake-uuid";

const idGenerator = new Worker();
const nextId = () => idGenerator.nextId().toString();

export default nextId;
