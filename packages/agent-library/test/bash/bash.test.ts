import { expect, spyOn, test } from "bun:test";
import { BashAgent } from "@aigne/agent-library/bash/index.js";

test("BashAgent should support disable sandbox", async () => {
  const bashAgent = new BashAgent({
    sandbox: false,
  });

  const script = `curl https://bing.com`;

  const runInSandboxSpy = spyOn(bashAgent, "runInSandbox");

  expect(await bashAgent.invoke({ script })).toMatchInlineSnapshot(`
    {
      "exitCode": 0,
      "stderr": 
    "  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed

      0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
    100   193  100   193    0     0    691      0 --:--:-- --:--:-- --:--:--   691
    "
    ,
      "stdout": 
    "<html><head><title>Object moved</title></head><body>
    <h2>Object moved to <a href="https://www.bing.com:443/?toWww=1&amp;redig=D26DC3A15DA244F9AB9D1A420426F9E5">here</a>.</h2>
    </body></html>
    "
    ,
    }
  `);

  expect(runInSandboxSpy).not.toHaveBeenCalled();
});

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

test("BashAgent should resolve curl with authorized domains", async () => {
  const bashAgent = new BashAgent({
    sandbox: {
      network: {
        allowedDomains: ["bing.com"],
      },
    },
  });

  const script = `curl https://bing.com`;

  expect(await bashAgent.invoke({ script })).toMatchInlineSnapshot(`
    {
      "exitCode": 0,
      "stderr": 
    "  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed

      0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
      0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
    100   193  100   193    0     0    685      0 --:--:-- --:--:-- --:--:--   684
    "
    ,
      "stdout": 
    "<html><head><title>Object moved</title></head><body>
    <h2>Object moved to <a href="https://www.bing.com:443/?toWww=1&amp;redig=E85302DF604C44219709AEBF09B3A5B7">here</a>.</h2>
    </body></html>
    "
    ,
    }
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

  const script = `curl https://bing.com`;

  expect(await bashAgent.invoke({ script })).toMatchInlineSnapshot(`
    {
      "exitCode": 56,
      "stderr": 
    "  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed

      0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
      0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
    curl: (56) CONNECT tunnel failed, response 403
    "
    ,
    }
  `);
});
