import { test } from "bun:test";

test("should successfully execute the chatbot", () => import("./index.js"), { timeout: 60000 });
