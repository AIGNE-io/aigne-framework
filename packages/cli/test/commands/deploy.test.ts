import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { stringify } from "yaml";
import yargs from "yargs";
import {
  createDeployCommands,
  DEPLOYED_FILE,
  deploy,
  fileExists,
  run,
} from "../../src/commands/deploy.js";

const spawnMock = mock((cmd: string) => {
  const stdoutHandlers: any[] = [];
  const stderrHandlers: any[] = [];

  return {
    stdout: {
      on: (event: string, cb: any) => {
        if (event === "data") stdoutHandlers.push(cb);
      },
    },
    stderr: {
      on: (event: string, cb: any) => {
        if (event === "data") stderrHandlers.push(cb);
      },
    },
    on: (event: string, cb: any) => {
      if (event === "close") {
        if (cmd === "error") {
          stderrHandlers.forEach((fn) => fn("err-msg"));
          cb(1);
        } else {
          stdoutHandlers.forEach((fn) =>
            fn("Created Blocklet DID: z2qa6yt75HHQL3cS4ao7j2aqVodExoBAN7xeS"),
          );
          cb(0);
        }
      }
    },
  } as any;
});

beforeEach(async () => {
  const childProcess = await import("node:child_process");
  const spawnSpy = spyOn(childProcess, "spawn");
  spawnSpy.mockImplementation(spawnMock as any);
});

describe("run", () => {
  it("should capture stdout on success", async () => {
    const result = await run("echo", ["test"]);
    expect(result).toContain("Created Blocklet DID");
    expect(spawnMock).toHaveBeenCalledWith("echo", ["test"], expect.any(Object));
  });

  it("should reject on error", async () => {
    await expect(run("error", [])).rejects.toThrow("err-msg");
    expect(spawnMock).toHaveBeenCalledWith("error", [], expect.any(Object));
  });
});

describe("createDeployCommands", () => {
  it("should build deploy command", () => {
    const cmd = createDeployCommands();
    expect(cmd.command).toBe("deploy");
    expect(cmd.describe).toMatch(/Deploy/);
  });

  it("should have builder function", () => {
    const cmd = createDeployCommands();
    expect(typeof cmd.builder).toBe("function");
  });

  it("should have handler function", async () => {
    const path = join(import.meta.dirname, "../_mocks_/deploy");
    const aigneHomeDir = join(homedir(), ".aigne");
    const deployedFile = join(aigneHomeDir, DEPLOYED_FILE);
    if (!(await fileExists(aigneHomeDir))) {
      await mkdir(aigneHomeDir, { recursive: true });
    }

    await writeFile(deployedFile, stringify({ [path]: { name: "my-blocklet" } }));

    const command = yargs().command(createDeployCommands());
    await command.parseAsync(["deploy", "--path", path, "--endpoint", "http://endpoint"]);
  });

  it("should exit when path or endpoint missing", async () => {
    const cmd = createDeployCommands();
    const exitSpy = spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new Error(`exit ${code}`);
    }) as any);

    await expect(cmd.handler({} as any)).rejects.toThrow("exit 1");
    await expect(cmd.handler({ path: "p" } as any)).rejects.toThrow("exit 1");

    expect(exitSpy).toHaveBeenCalledTimes(2);
    exitSpy.mockRestore();
  });
});

describe("deploy function", () => {
  it("should run deploy tasks successfully (mocked)", async () => {
    const path = join(import.meta.dirname, "../_mocks_/deploy");
    const aigneHomeDir = join(homedir(), ".aigne");

    await writeFile(
      join(aigneHomeDir, DEPLOYED_FILE),
      stringify({
        [path]: {
          name: "my-blocklet",
          did: "z2qa6yt75HHQL3cS4ao7j2aqVodExoBAN7xeS",
        },
      }),
    );

    await deploy(path, "http://endpoint");
  });
});
