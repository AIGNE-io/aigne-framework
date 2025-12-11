import { afterEach, beforeEach, expect, type Mock, spyOn, test } from "bun:test";
import { BashAgent } from "@aigne/agent-library/bash/index.js";
import { AIAgent, FunctionAgent } from "@aigne/core";
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
  const bashAgent = (await BashAgent.load({
    filepath: "/path/to/agent.yaml",
    parsed: {
      sandbox: false,
      timeout: 30e3,
      permissions: {
        allow: ["echo:*"],
        deny: ["rm:*"],
        defaultMode: "ask",
        guard: {
          type: "ai",
        },
      },
    },
  })) as BashAgent;

  expect(bashAgent.guard).toBeInstanceOf(AIAgent);

  expect(bashAgent.options).toMatchInlineSnapshot(
    {
      permissions: {
        guard: expect.any(AIAgent),
      },
    },
    `
    {
      "permissions": {
        "allow": [
          "echo:*",
        ],
        "defaultMode": "ask",
        "deny": [
          "rm:*",
        ],
        "guard": Any<AIAgent>,
      },
      "sandbox": false,
      "timeout": 30000,
    }
  `,
  );
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

test("BashAgent should run bash scripts without sandbox", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
  });

  const script = `echo "Hello, World!"
echo "This is an error message" >&2
exit 0`;

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

  const errorScript = `echo "Hello, World!"
echo "This is an error message" >&2
exit 1`;

  expect(bashAgent.invoke({ script: errorScript })).rejects.toThrowErrorMatchingInlineSnapshot(`
    "Bash script exited with code 1: This is an error message
    "
  `);
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

test("BashAgent should raise error on timeout", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    timeout: 100, // 100 ms
  });

  const script = `echo "Hello, World!"
echo "This is an error message" >&2
sleep 1
exit 0`;

  expect(bashAgent.invoke({ script })).rejects.toThrowErrorMatchingInlineSnapshot(`
    "Bash script killed by signal SIGTERM (likely timeout 100): This is an error message
    "
  `);
});

// Permissions tests
test("BashAgent should allow command in whitelist", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*", "ls:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  const script = `echo "Allowed command"`;

  expect(await bashAgent.invoke({ script })).toMatchObject({
    exitCode: 0,
    stdout: expect.stringContaining("Allowed command"),
  });
});

test("BashAgent should deny command in blacklist", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: [],
      deny: ["rm:*", "sudo:*"],
      defaultMode: "allow",
    },
  });

  const script = `rm -rf /tmp/test`;

  expect(bashAgent.invoke({ script })).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Command blocked by permissions: rm -rf /tmp/test"`,
  );
});

test("BashAgent should respect exact match in allow list", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["git status"],
      deny: [],
      defaultMode: "deny",
    },
  });

  // Exact match should pass
  expect(await bashAgent.invoke({ script: "git status" })).toMatchObject({
    exitCode: 0,
  });

  // Non-exact match should be denied
  expect(bashAgent.invoke({ script: "git status --short" })).rejects.toThrowError(
    "Command blocked by permissions",
  );
});

test("BashAgent should support prefix matching with :* wildcard", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo test:*", "printf diff:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  // Should match prefix
  expect(await bashAgent.invoke({ script: "echo test" })).toMatchObject({
    exitCode: 0,
  });

  expect(await bashAgent.invoke({ script: "echo test:unit" })).toMatchObject({
    exitCode: 0,
  });

  expect(await bashAgent.invoke({ script: "printf diff HEAD" })).toMatchObject({
    exitCode: 0,
  });

  // Should not match different prefix
  expect(bashAgent.invoke({ script: "echo build" })).rejects.toThrowError(
    "Command blocked by permissions",
  );
});

test("BashAgent should prioritize deny over allow", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"], // Allow all echo commands
      deny: ["echo danger:*"], // But deny echo danger
      defaultMode: "allow",
    },
  });

  // echo hello should be allowed
  expect(await bashAgent.invoke({ script: "echo hello" })).toMatchObject({
    exitCode: 0,
  });

  // echo danger should be denied (deny takes priority)
  expect(
    bashAgent.invoke({ script: "echo danger zone" }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Command blocked by permissions: echo danger zone"`,
  );
});

test("BashAgent should apply defaultMode when no match", async () => {
  // Test defaultMode: 'deny'
  const denyByDefault = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(denyByDefault.invoke({ script: "ls" })).rejects.toThrowError(
    "Command blocked by permissions",
  );

  // Test defaultMode: 'allow' (default)
  const allowByDefault = new BashAgent({
    sandbox: false,
    permissions: {
      allow: [],
      deny: ["rm:*"],
      defaultMode: "allow",
    },
  });

  expect(await allowByDefault.invoke({ script: "echo test" })).toMatchObject({
    exitCode: 0,
  });
});

test("BashAgent should work without permissions config", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    // No permissions config - should allow everything
  });

  expect(await bashAgent.invoke({ script: "echo test" })).toMatchObject({
    exitCode: 0,
    stdout: expect.stringContaining("test"),
  });
});

test("BashAgent should require guard agent for ask mode", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: [],
      deny: [],
      defaultMode: "ask",
      // No guard agent configured
    },
  });

  expect(bashAgent.invoke({ script: "echo test" })).rejects.toThrowErrorMatchingInlineSnapshot(
    `"No guard agent configured for permission 'ask'"`,
  );
});

test("BashAgent should ask guard agent for permission in ask mode", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: [],
      deny: [],
      defaultMode: "ask",
      guard: FunctionAgent.from(({ script }) => ({
        approved: script.includes("echo allowed"),
        reason: `Script was "${script}"`,
      })),
    },
  });

  expect(bashAgent.invoke({ script: "echo test" })).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Command rejected by user: echo test, reason: Script was "echo test""`,
  );
  expect(await bashAgent.invoke({ script: "echo allowed command" })).toMatchObject({
    exitCode: 0,
  });
});

test("BashAgent should handle whitespace in commands", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  // Command with leading/trailing whitespace should still match
  expect(await bashAgent.invoke({ script: "  echo test  " })).toMatchObject({
    exitCode: 0,
  });
});

test("BashAgent permissions should work with sandbox enabled", async () => {
  const bashAgent = new BashAgent({
    sandbox: true,
    permissions: {
      allow: ["echo:*"],
      deny: ["rm:*"],
      defaultMode: "deny",
    },
  });

  const spawnSpy = spyOn(bashAgent, "spawn").mockResolvedValueOnce(
    new ReadableStream({
      start(controller) {
        controller.enqueue({ delta: { text: { stdout: "Hello\n" } } });
        controller.enqueue({ delta: { json: { exitCode: 0 } } });
        controller.close();
      },
    }),
  );

  // Allowed command should pass
  expect(await bashAgent.invoke({ script: "echo Hello" })).toMatchObject({
    exitCode: 0,
    stdout: expect.stringContaining("Hello"),
  });

  // Denied command should fail before reaching sandbox
  expect(bashAgent.invoke({ script: "rm -rf /tmp/test" })).rejects.toThrowError(
    "Command blocked by permissions",
  );

  // spawn should only be called once (for the allowed command)
  expect(spawnSpy).toHaveBeenCalledTimes(1);
});
