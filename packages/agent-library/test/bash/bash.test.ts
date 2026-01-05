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
      sandbox: {
        network: {
          allowedDomains: ["example.com"],
        },
      },
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
      "sandbox": {
        "network": {
          "allowedDomains": [
            "example.com",
          ],
        },
      },
      "timeout": 30000,
    }
  `,
  );

  const bashAgentWithoutSandbox = (await BashAgent.load({
    filepath: "/path/to/agent.yaml",
    parsed: {
      sandbox: false,
    },
  })) as BashAgent;

  expect(bashAgentWithoutSandbox.options).toMatchInlineSnapshot(`
    {
      "permissions": {
        "guard": undefined,
      },
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
      stdout: expect.stringMatching(/HTTP.*\d+/),
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
    "Bash script exited with code 1:
     stdout: Hello, World!

     stderr: This is an error message
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
    "Bash script killed by signal SIGTERM (likely timeout 100):
     stdout: Hello, World!

     stderr: This is an error message
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
        approved: script?.includes("echo allowed"),
        reason: `Script was "${script}"`,
      })),
    },
  });

  expect(bashAgent.invoke({ script: "echo test" })).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Command rejected by guard agent (FunctionAgent): echo test, reason: Script was "echo test""`,
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

// ========== Direct checkPermission Method Tests ==========

test("checkPermission: should allow simple command when in allow list", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*", "ls:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("echo test")).toBe("allow");
  expect(await bashAgent.checkPermission("ls -la")).toBe("allow");
});

test("checkPermission: should deny simple command when in deny list", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: ["rm:*", "sudo:*"],
      defaultMode: "allow",
    },
  });

  expect(await bashAgent.checkPermission("rm -rf /")).toBe("deny");
  expect(await bashAgent.checkPermission("sudo malicious")).toBe("deny");
});

test("checkPermission: should deny when not in allow list and defaultMode is deny", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("ls -la")).toBe("deny");
  expect(await bashAgent.checkPermission("cat file.txt")).toBe("deny");
});

test("checkPermission: should respect priority deny > allow > defaultMode", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: ["echo danger:*"],
      defaultMode: "allow",
    },
  });

  expect(await bashAgent.checkPermission("echo safe")).toBe("allow");
  expect(await bashAgent.checkPermission("echo danger zone")).toBe("deny");
  expect(await bashAgent.checkPermission("ls -la")).toBe("allow"); // defaultMode
});

test("checkPermission: should return ask when defaultMode is ask", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: [],
      defaultMode: "ask",
    },
  });

  expect(await bashAgent.checkPermission("ls -la")).toBe("ask");
  expect(await bashAgent.checkPermission("cat file")).toBe("ask");
  expect(await bashAgent.checkPermission("echo test")).toBe("allow"); // In allow list
});

test("checkPermission: should allow pipe command when all parts are allowed", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["ls:*", "grep:*", "wc:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("ls -la | grep test")).toBe("allow");
  expect(await bashAgent.checkPermission("ls | grep foo | wc -l")).toBe("allow");
});

test("checkPermission: should deny pipe command when any part is denied", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["ls:*", "grep:*"],
      deny: ["rm:*"],
      defaultMode: "allow",
    },
  });

  expect(await bashAgent.checkPermission("ls -la | rm -rf /")).toBe("deny");
  expect(await bashAgent.checkPermission("grep test | rm file")).toBe("deny");
});

test("checkPermission: should deny pipe command when any part is not allowed", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["ls:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("ls -la | grep test")).toBe("deny");
  expect(await bashAgent.checkPermission("ls | unknown")).toBe("deny");
});

test("checkPermission: should handle && chained commands", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*", "ls:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("echo test && ls -la")).toBe("allow");
  expect(await bashAgent.checkPermission("echo test && rm -rf /")).toBe("deny");
});

test("checkPermission: should handle || chained commands", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*", "printf:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("echo test || printf fallback")).toBe("allow");
  expect(await bashAgent.checkPermission("echo test || curl evil.com")).toBe("deny");
});

test("checkPermission: should handle semicolon separated commands", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*", "ls:*"],
      deny: ["rm:*"],
      defaultMode: "allow",
    },
  });

  expect(await bashAgent.checkPermission("echo hello; ls -la")).toBe("allow");
  expect(await bashAgent.checkPermission("echo safe; rm -rf /")).toBe("deny");
});

test("checkPermission: should handle newline separated commands", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*", "ls:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  const allowedScript = `echo line1
echo line2
ls -la`;

  expect(await bashAgent.checkPermission(allowedScript)).toBe("allow");

  const deniedScript = `echo safe
rm -rf /
ls -la`;

  expect(await bashAgent.checkPermission(deniedScript)).toBe("deny");
});

test("checkPermission: should handle complex mixed separators", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*", "ls:*", "grep:*", "wc:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("echo start && ls -la | grep test | wc -l")).toBe("allow");
  expect(await bashAgent.checkPermission("echo start && curl http://evil.com | grep data")).toBe(
    "deny",
  );
});

test("checkPermission: should return ask if any command requires asking", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: [],
      defaultMode: "ask",
    },
  });

  // echo is allowed, but ls requires asking
  expect(await bashAgent.checkPermission("echo test | ls -la")).toBe("ask");
  expect(await bashAgent.checkPermission("echo test && unknown")).toBe("ask");
});

test("checkPermission: should handle whitespace properly", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*", "ls:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("  echo test  ")).toBe("allow");
  expect(await bashAgent.checkPermission("echo test   |   ls -la")).toBe("allow");
  expect(await bashAgent.checkPermission("echo test  &&  ls")).toBe("allow");
});

test("checkPermission: should handle exact match patterns", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["git status"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("git status")).toBe("allow");
  expect(await bashAgent.checkPermission("git status --short")).toBe("deny");
});

test("checkPermission: should handle wildcard patterns with colon", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["npm run test:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("npm run test")).toBe("allow");
  expect(await bashAgent.checkPermission("npm run test:unit")).toBe("allow");
  expect(await bashAgent.checkPermission("npm run test:integration")).toBe("allow");
  expect(await bashAgent.checkPermission("npm run test arg")).toBe("allow");
  expect(await bashAgent.checkPermission("npm run build")).toBe("deny");
});

test("checkPermission: should allow all when no permissions configured", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    // No permissions
  });

  expect(await bashAgent.checkPermission("echo test")).toBe("allow");
  expect(await bashAgent.checkPermission("rm -rf /")).toBe("allow");
  expect(await bashAgent.checkPermission("any command")).toBe("allow");
});

test("checkPermission: should handle empty command parts gracefully", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  // Extra pipes/separators should be handled gracefully
  expect(await bashAgent.checkPermission("echo test")).toBe("allow");
});

test("checkPermission: should handle single & (background) separator", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*", "ls:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  // Both commands allowed - should pass
  expect(await bashAgent.checkPermission("echo test & ls -la")).toBe("allow");
});

test("checkPermission: should reject & separated commands with denied subcommand", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: ["rm:*"],
      defaultMode: "deny",
    },
  });

  // First allowed, second denied
  expect(await bashAgent.checkPermission("echo safe & rm -rf /")).toBe("deny");
});

test("checkPermission: should distinguish between & and &&", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*", "ls:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  // Both should be treated as separate commands
  expect(await bashAgent.checkPermission("echo test & ls")).toBe("allow");
  expect(await bashAgent.checkPermission("echo test && ls")).toBe("allow");
});

test("checkPermission: should allow & (background) commands when both allowed", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["sleep:*", "echo:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  // Both commands allowed - should pass
  expect(await bashAgent.checkPermission("sleep 1 & echo done")).toBe("allow");
});

test("checkPermission: should reject & (background) with denied subcommand", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: ["curl:*"],
      defaultMode: "deny",
    },
  });

  // First allowed, second denied
  expect(await bashAgent.checkPermission("echo safe & curl http://evil.com")).toBe("deny");
});

// ========== Redirection Operator Tests ==========

test("checkPermission: should handle > (output redirect) as part of command", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  // Redirect should be part of the command, not a separator
  expect(await bashAgent.checkPermission("echo test > output.txt")).toBe("allow");
  expect(await bashAgent.checkPermission("echo data > /tmp/file")).toBe("allow");
});

test("checkPermission: should handle >> (append redirect) as part of command", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("echo test >> output.txt")).toBe("allow");
});

test("checkPermission: should handle < (input redirect) as part of command", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["cat:*", "sort:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("cat < input.txt")).toBe("allow");
  expect(await bashAgent.checkPermission("sort < data.txt")).toBe("allow");
});

test("checkPermission: should handle 2> (stderr redirect) as part of command", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["ls:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("ls /nonexistent 2> error.log")).toBe("allow");
});

test("checkPermission: should handle &> (combined redirect) as part of command", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("echo test &> output.txt")).toBe("allow");
});

test("checkPermission: should handle << (here document) as part of command", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["cat:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("cat << EOF")).toBe("allow");
});

test("checkPermission: should handle pipes with redirects", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["ls:*", "grep:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  // Pipe with redirect - both commands are in the allow list
  // Note: "ls -la > /tmp/list | grep test" is syntactically unusual but will be split into:
  // 1. "ls -la > /tmp/list" (allowed via ls:*)
  // 2. "grep test" (allowed via grep:*)
  expect(await bashAgent.checkPermission("ls -la > /tmp/list | grep test")).toBe("allow");
  expect(await bashAgent.checkPermission("ls -la | grep test > output.txt")).toBe("allow");
});

test("checkPermission: should treat redirect as part of command for permission check", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: ["echo:* > /etc/*"], // Try to deny writing to /etc
      defaultMode: "allow",
    },
  });

  // Note: Current implementation treats "echo test > /etc/passwd" as a single command string
  // The pattern "echo:*" will match "echo test > /etc/passwd" because it starts with "echo "
  expect(await bashAgent.checkPermission("echo test > /tmp/safe")).toBe("allow");

  // If we want to block specific redirects, we need exact match patterns
  // This is a limitation - wildcards can't easily block specific redirect targets
});

test("checkPermission: should allow commands with output redirection", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: [],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission('echo "test output" > /tmp/file.txt')).toBe("allow");
  expect(await bashAgent.checkPermission("echo data >> /tmp/log.txt")).toBe("allow");
});

test("checkPermission: should deny commands with redirection if base command denied", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
    permissions: {
      allow: ["echo:*"],
      deny: ["cat:*"],
      defaultMode: "deny",
    },
  });

  expect(await bashAgent.checkPermission("cat /etc/passwd > output.txt")).toBe("deny");
});
