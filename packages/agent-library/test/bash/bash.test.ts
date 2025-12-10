import { afterEach, beforeEach, expect, type Mock, spyOn, test } from "bun:test";
import { BashAgent } from "@aigne/agent-library/bash/index.js";
import { SandboxManager } from "@anthropic-ai/sandbox-runtime";

let initialize: Mock<typeof SandboxManager.initialize>;
let updateConfig: Mock<typeof SandboxManager.updateConfig>;
let wrapWithSandbox: Mock<typeof SandboxManager.wrapWithSandbox>;

beforeEach(() => {
  initialize = spyOn(SandboxManager, "initialize").mockResolvedValueOnce();
  updateConfig = spyOn(SandboxManager, "updateConfig").mockReturnValue();
  wrapWithSandbox = spyOn(SandboxManager, "wrapWithSandbox").mockResolvedValue(
    'sandbox-exec -p /path/to/profile bash -c "SCRIPT"',
  );
});

afterEach(() => {
  initialize.mockRestore();
  updateConfig.mockRestore();
  wrapWithSandbox.mockRestore();
});

test("BashAgent should load correctly", async () => {
  const bashAgent = await BashAgent.load({
    filepath: "/path/to/agent.yaml",
    parsed: {
      sandbox: false,
    },
  });

  expect((bashAgent as BashAgent).options).toMatchInlineSnapshot(`
    {
      "sandbox": false,
    }
  `);
});

test("BashAgent should support disable sandbox", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
  });

  const script = `curl -I https://bing.com`;

  const spawnSpy = spyOn(bashAgent, "spawn");

  expect(await bashAgent.invoke({ script })).toEqual(
    expect.objectContaining({
      exitCode: 0,
      stdout: expect.stringMatching(/HTTP.*301/),
    }),
  );

  expect(spawnSpy.mock.lastCall).toMatchInlineSnapshot(`
      [
        "bash",
        [
          "-c",
          "curl -I https://bing.com",
        ],
      ]
    `);
  expect(initialize).not.toHaveBeenCalled();
  expect(updateConfig).not.toHaveBeenCalled();
  expect(wrapWithSandbox).not.toHaveBeenCalled();
});

test("BashAgent should run bash scripts in sandbox", async () => {
  const bashAgent = new BashAgent({});

  const script = `echo "Hello, World!"
echo "This is an error message" >&2
exit 0`;

  const spawnSpy = spyOn(bashAgent, "spawn").mockResolvedValueOnce(
    new ReadableStream({
      start(controller) {
        controller.enqueue({ delta: { text: { stdout: "Hello, World!\n" } } });
        controller.enqueue({ delta: { text: { stderr: "This is an error message\n" } } });
        controller.enqueue({ delta: { json: { exitCode: 0 } } });
        controller.close();
      },
    }),
  );

  expect(await bashAgent.invoke({ script })).toMatchInlineSnapshot(`
    {
      "exitCode": 0,
      "stderr": 
    "This is an error message
    "
    ,
      "stdout": 
    "Hello, World!
    "
    ,
    }
  `);

  expect(spawnSpy.mock.lastCall).toMatchInlineSnapshot(
    [expect.stringContaining("sandbox-exec -p"), undefined, {}],
    `
    [
      StringContaining "sandbox-exec -p",
      undefined,
      {
        "shell": true,
      },
    ]
  `,
  );

  expect(initialize).toHaveBeenCalled();
  expect(updateConfig.mock.lastCall?.[0]).toMatchInlineSnapshot(
    {
      ripgrep: { command: expect.any(String) },
    },
    `
    {
      "filesystem": {
        "allowWrite": [],
        "denyRead": [],
        "denyWrite": [],
      },
      "network": {
        "allowedDomains": [],
        "deniedDomains": [],
      },
      "ripgrep": {
        "command": Any<String>,
      },
    }
  `,
  );
  expect(wrapWithSandbox.mock.lastCall).toMatchInlineSnapshot(`
    [
      
    "echo "Hello, World!"
    echo "This is an error message" >&2
    exit 0"
    ,
    ]
  `);
});

test("BashAgent should resolve curl with authorized domains", async () => {
  const bashAgent = new BashAgent({
    sandbox: {
      network: {
        allowedDomains: ["bing.com"],
      },
    },
  });

  const spawnSpy = spyOn(bashAgent, "spawn").mockResolvedValueOnce(
    new ReadableStream({
      start(controller) {
        controller.enqueue({ delta: { text: { stdout: "HTTP/1.1 301 Moved Permanently\r\n" } } });
        controller.enqueue({ delta: { json: { exitCode: 0 } } });
        controller.close();
      },
    }),
  );

  const script = `curl -I https://bing.com`;

  expect(await bashAgent.invoke({ script })).toEqual(
    expect.objectContaining({
      exitCode: 0,
      stdout: expect.stringMatching(/HTTP.* 301/i),
    }),
  );

  expect(spawnSpy.mock.lastCall).toMatchInlineSnapshot(
    [expect.stringContaining("sandbox-exec -p"), undefined, {}],
    `
    [
      StringContaining "sandbox-exec -p",
      undefined,
      {
        "shell": true,
      },
    ]
  `,
  );

  expect(updateConfig.mock.lastCall?.[0]).toMatchInlineSnapshot(
    {
      ripgrep: { command: expect.any(String) },
    },
    `
    {
      "filesystem": {
        "allowWrite": [],
        "denyRead": [],
        "denyWrite": [],
      },
      "network": {
        "allowedDomains": [
          "bing.com",
        ],
        "deniedDomains": [],
      },
      "ripgrep": {
        "command": Any<String>,
      },
    }
  `,
  );
  expect(wrapWithSandbox.mock.lastCall).toMatchInlineSnapshot(`
    [
      "curl -I https://bing.com",
    ]
  `);
});

test("BashAgent should reject curl with unauthorized domains", async () => {
  const bashAgent = new BashAgent({
    sandbox: {
      network: {
        allowedDomains: ["google.com"],
        deniedDomains: [],
      },
    },
  });

  const spawnSpy = spyOn(bashAgent, "spawn").mockResolvedValueOnce(
    new ReadableStream({
      start(controller) {
        controller.enqueue({
          delta: { text: { stderr: "curl: (56) Recv failure: Forbidden\r\n" } },
        });
        controller.enqueue({ delta: { json: { exitCode: 56 } } });
        controller.close();
      },
    }),
  );

  const script = `curl -I https://bing.com`;

  expect(await bashAgent.invoke({ script })).toMatchInlineSnapshot(`
    {
      "exitCode": 56,
      "stderr": 
    "curl: (56) Recv failure: Forbidden
    "
    ,
    }
  `);

  expect(spawnSpy.mock.lastCall).toMatchInlineSnapshot(
    [expect.stringContaining("sandbox-exec -p"), undefined, {}],
    `
      [
        StringContaining "sandbox-exec -p",
        undefined,
        {
          "shell": true,
        },
      ]
    `,
  );

  expect(updateConfig.mock.lastCall?.[0]).toMatchInlineSnapshot(
    {
      ripgrep: { command: expect.any(String) },
    },
    `
    {
      "filesystem": {
        "allowWrite": [],
        "denyRead": [],
        "denyWrite": [],
      },
      "network": {
        "allowedDomains": [
          "google.com",
        ],
        "deniedDomains": [],
      },
      "ripgrep": {
        "command": Any<String>,
      },
    }
  `,
  );
  expect(wrapWithSandbox.mock.lastCall).toMatchInlineSnapshot(`
    [
      "curl -I https://bing.com",
    ]
  `);
});
