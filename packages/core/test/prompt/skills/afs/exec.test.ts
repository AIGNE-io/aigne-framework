import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS } from "@aigne/afs";
import { getAFSSkills } from "@aigne/core/prompt/skills/afs";

test("AFS'skill exec should invoke afs.exec", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const exec = skills.find((i) => i.name === "afs_exec");

  const mockResult = { output: "success", data: { value: 42 } };
  const execSpy = spyOn(afs, "exec").mockResolvedValue({
    data: mockResult,
  });

  assert(exec);
  expect(
    await exec.invoke({
      path: "/agents/test-agent",
      args: JSON.stringify({ input: "test" }),
    }),
  ).toMatchInlineSnapshot(`
    {
      "data": {
        "data": {
          "value": 42,
        },
        "output": "success",
      },
    }
  `);

  expect(execSpy.mock.calls[0]?.[0]).toBe("/agents/test-agent");
  expect(execSpy.mock.calls[0]?.[1]).toMatchObject({ input: "test" });
});

test("AFS'skill exec should parse JSON args", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const exec = skills.find((i) => i.name === "afs_exec");

  const execSpy = spyOn(afs, "exec").mockResolvedValue({
    data: {},
  });

  assert(exec);
  const args = { name: "test", count: 5, enabled: true };
  await exec.invoke({
    path: "/functions/process",
    args: JSON.stringify(args),
  });

  expect(execSpy.mock.calls[0]?.[0]).toBe("/functions/process");
  expect(execSpy.mock.calls[0]?.[1]).toMatchObject(args);
});

test("AFS'skill exec should handle empty args", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const exec = skills.find((i) => i.name === "afs_exec");

  const execSpy = spyOn(afs, "exec").mockResolvedValue({
    data: { status: "ok" },
  });

  assert(exec);
  const result = await exec.invoke({
    path: "/agents/simple",
    args: "{}",
  });

  expect(result.data).toMatchObject({ status: "ok" });
  expect(execSpy.mock.calls[0]?.[1]).toEqual({});
});

test("AFS'skill exec should handle complex nested args", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const exec = skills.find((i) => i.name === "afs_exec");

  const execSpy = spyOn(afs, "exec").mockResolvedValue({
    data: { success: true },
  });

  assert(exec);
  const complexArgs = {
    user: { name: "John", age: 30 },
    options: { verbose: true, count: 10 },
    items: ["a", "b", "c"],
  };

  await exec.invoke({
    path: "/modules/processor",
    args: JSON.stringify(complexArgs),
  });

  expect(execSpy.mock.calls[0]?.[1]).toMatchObject(complexArgs);
});

test("AFS'skill exec should return function result", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const exec = skills.find((i) => i.name === "afs_exec");

  const functionResult = {
    computed: 100,
    message: "Calculation complete",
    data: [1, 2, 3, 4, 5],
  };

  spyOn(afs, "exec").mockResolvedValue({
    data: functionResult,
  });

  assert(exec);
  const result = await exec.invoke({
    path: "/functions/calculate",
    args: JSON.stringify({ x: 10, y: 10 }),
  });

  expect(result.data).toMatchObject(functionResult);
  expect(result.data.computed).toBe(100);
  expect(result.data.data).toHaveLength(5);
});

test("AFS'skill exec should handle different executable paths", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const exec = skills.find((i) => i.name === "afs_exec");

  const execSpy = spyOn(afs, "exec").mockResolvedValue({
    data: {},
  });

  assert(exec);

  // Test agent path
  await exec.invoke({ path: "/agents/agent1", args: "{}" });
  expect(execSpy.mock.calls[0]?.[0]).toBe("/agents/agent1");

  // Test function path
  await exec.invoke({ path: "/functions/fn1", args: "{}" });
  expect(execSpy.mock.calls[1]?.[0]).toBe("/functions/fn1");

  // Test nested path
  await exec.invoke({ path: "/modules/utils/helper", args: "{}" });
  expect(execSpy.mock.calls[2]?.[0]).toBe("/modules/utils/helper");
});

test("AFS'skill exec should throw error for invalid JSON args", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const exec = skills.find((i) => i.name === "afs_exec");

  spyOn(afs, "exec").mockResolvedValue({
    data: {},
  });

  assert(exec);

  try {
    await exec.invoke({
      path: "/test",
      args: "invalid json",
    });
    expect(true).toBe(false); // Should not reach here
  } catch (error) {
    expect(error).toBeInstanceOf(SyntaxError);
  }
});
