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

    expect(await bashAgent.invoke({ script })).toMatchInlineSnapshot(`
    {
      "exitCode": 0,
      "stderr": 
    "  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed

      0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
      0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
      0   193    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
    "
    ,
      "stdout": 
    "HTTP/2 301 
    cache-control: private
    content-length: 193
    content-type: text/html; charset=utf-8
    location: https://www.bing.com:443/?toWww=1&redig=6AD44680AA4144B3A84945F7A758554B
    set-cookie: MUID=255C4E14C9A5669216D858AAC8F467B5; domain=bing.com; expires=Mon, 04-Jan-2027 00:22:01 GMT; path=/; secure; SameSite=None
    set-cookie: MUIDB=255C4E14C9A5669216D858AAC8F467B5; expires=Mon, 04-Jan-2027 00:22:01 GMT; path=/; HttpOnly
    set-cookie: _EDGE_S=F=1&SID=2636E3924B0063970FA0F52C4A51626B; domain=bing.com; path=/; HttpOnly
    set-cookie: _EDGE_V=1; domain=bing.com; expires=Mon, 04-Jan-2027 00:22:01 GMT; path=/; HttpOnly
    alt-svc: h3=":443"; ma=3600
    x-eventid: 6938bd2913374b36b15618ff99a16ba5
    useragentreductionoptout: A7kgTC5xdZ2WIVGZEfb1hUoNuvjzOZX3VIV/BA6C18kQOOF50Q0D3oWoAm49k3BQImkujKILc7JmPysWk3CSjwUAAACMeyJvcmlnaW4iOiJodHRwczovL3d3dy5iaW5nLmNvbTo0NDMiLCJmZWF0dXJlIjoiU2VuZEZ1bGxVc2VyQWdlbnRBZnRlclJlZHVjdGlvbiIsImV4cGlyeSI6MTY4NDg4NjM5OSwiaXNTdWJkb21haW4iOnRydWUsImlzVGhpcmRQYXJ0eSI6dHJ1ZX0=
    strict-transport-security: max-age=31536000; includeSubDomains; preload
    permissions-policy: unload=()
    content-security-policy: script-src https: 'strict-dynamic' 'report-sample' 'wasm-unsafe-eval' 'nonce-vczosuJ6jaZHHDn/9qMd+lgATW2p1GUfm52YMLO+fMY='; base-uri 'self';
    x-cache: CONFIG_NOCACHE
    accept-ch: Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Full-Version, Sec-CH-UA-Full-Version-List, Sec-CH-UA-Mobile, Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version
    x-msedge-ref: Ref A: 1785AC2F7D444D89AFC144FF0ECC4994 Ref B: HKG201051218023 Ref C: 2025-12-10T00:22:01Z
    date: Wed, 10 Dec 2025 00:22:00 GMT

    "
    ,
    }
  `);

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

    expect(await bashAgent.invoke({ script })).toMatchInlineSnapshot(`
    {
      "exitCode": 0,
      "stderr": 
    "  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed

      0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
      0   193    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
    "
    ,
      "stdout": 
    "HTTP/1.1 200 Connection Established

    HTTP/2 301 
    cache-control: private
    content-length: 193
    content-type: text/html; charset=utf-8
    location: https://www.bing.com:443/?toWww=1&redig=417D45B53CBA47D6A8F5664CF8566761
    set-cookie: MUID=1F64E71CCFD86DA503CEF1A2CE3F6C67; domain=bing.com; expires=Mon, 04-Jan-2027 00:22:01 GMT; path=/; secure; SameSite=None
    set-cookie: MUIDB=1F64E71CCFD86DA503CEF1A2CE3F6C67; expires=Mon, 04-Jan-2027 00:22:01 GMT; path=/; HttpOnly
    set-cookie: _EDGE_S=F=1&SID=26C8F59A016463EA1288E3240083628A; domain=bing.com; path=/; HttpOnly
    set-cookie: _EDGE_V=1; domain=bing.com; expires=Mon, 04-Jan-2027 00:22:01 GMT; path=/; HttpOnly
    alt-svc: h3=":443"; ma=3600
    x-eventid: 6938bd2936dd4f46ac4bf415e27a123a
    useragentreductionoptout: A7kgTC5xdZ2WIVGZEfb1hUoNuvjzOZX3VIV/BA6C18kQOOF50Q0D3oWoAm49k3BQImkujKILc7JmPysWk3CSjwUAAACMeyJvcmlnaW4iOiJodHRwczovL3d3dy5iaW5nLmNvbTo0NDMiLCJmZWF0dXJlIjoiU2VuZEZ1bGxVc2VyQWdlbnRBZnRlclJlZHVjdGlvbiIsImV4cGlyeSI6MTY4NDg4NjM5OSwiaXNTdWJkb21haW4iOnRydWUsImlzVGhpcmRQYXJ0eSI6dHJ1ZX0=
    strict-transport-security: max-age=31536000; includeSubDomains; preload
    permissions-policy: unload=()
    content-security-policy: script-src https: 'strict-dynamic' 'report-sample' 'wasm-unsafe-eval' 'nonce-akTjk+/C9JBY56Jh6zwOHP/lOKncz5mMWyFDg/hso0A='; base-uri 'self';
    x-cache: CONFIG_NOCACHE
    accept-ch: Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Full-Version, Sec-CH-UA-Full-Version-List, Sec-CH-UA-Mobile, Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version
    x-msedge-ref: Ref A: 33A2137375984CA693E8CFDE8D953B8C Ref B: HKG201051220036 Ref C: 2025-12-10T00:22:01Z
    date: Wed, 10 Dec 2025 00:22:01 GMT

    "
    ,
    }
  `);
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
      "stdout": 
    "HTTP/1.1 403 Forbidden
    Content-Type: text/plain
    X-Proxy-Error: blocked-by-allowlist

    "
    ,
    }
  `);
  },
  TEST_TIMEOUT,
);
