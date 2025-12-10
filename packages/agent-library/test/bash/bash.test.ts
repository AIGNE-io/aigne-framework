import { expect, spyOn, test } from "bun:test";
import { BashAgent } from "@aigne/agent-library/bash/index.js";

const TEST_TIMEOUT = 60 * 1000; // 2 minutes

test(
  "BashAgent should support disable sandbox",
  async () => {
    const bashAgent = new BashAgent({
      sandbox: false,
    });

    const script = `curl -I https://bing.com`;

    const runInSandboxSpy = spyOn(bashAgent, "runInSandbox");

    expect(await bashAgent.invoke({ script })).toEqual(
      expect.objectContaining({
        exitCode: 0,
        stdout: expect.stringMatching(/HTTP.* 301/i),
      }),
    );

    expect(runInSandboxSpy).not.toHaveBeenCalled();
  },
  TEST_TIMEOUT,
);

test("BashAgent should run bash scripts in sandbox", async () => {
  const bashAgent = new BashAgent({});

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
});

test(
  "BashAgent should resolve curl with authorized domains",
  async () => {
    const bashAgent = new BashAgent({
      sandbox: {
        network: {
          allowedDomains: ["bing.com"],
        },
      },
    });

    const script = `curl -I https://bing.com`;

    expect(await bashAgent.invoke({ script })).toEqual(
      expect.objectContaining({
        exitCode: 0,
        stdout: expect.stringMatching(/HTTP.* 301/i),
      }),
    );
  },
  TEST_TIMEOUT,
);

test(
  "BashAgent should reject curl with unauthorized domains",
  async () => {
    const bashAgent = new BashAgent({
      sandbox: {
        network: {
          allowedDomains: ["google.com"],
          deniedDomains: [],
        },
      },
    });

    const script = `curl -I https://bing.com`;

    expect(await bashAgent.invoke({ script })).toEqual(
      expect.objectContaining({
        exitCode: 56,
        stdout: expect.stringMatching(/HTTP.* 403 Forbidden/i),
      }),
    );
  },
  TEST_TIMEOUT,
);
