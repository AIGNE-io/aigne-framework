import { beforeEach, describe, expect, mock, test } from "bun:test";
import { TerminalInput, terminalInput } from "@aigne/cli/ui/utils/terminal-input.js";
import { render } from "ink-testing-library";

describe("terminalInput", () => {
  describe("terminalInput function", () => {
    let rendered: ReturnType<typeof render>;
    let result: Promise<string>;

    beforeEach(async () => {
      result = terminalInput({
        render: ((component) => {
          const r = render(component as any);
          rendered = r;
          return r as any;
        }) as NonNullable<Parameters<typeof terminalInput>[0]>["render"],
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    test("terminalInput function should resolve with input value", async () => {
      rendered.stdin.write("Test input");
      await new Promise((resolve) => setTimeout(resolve, 0));
      rendered.stdin.write("\r");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(result).resolves.toBe("Test input");
    });

    test("terminalInput function should handle error", async () => {
      rendered.stdin.write("\x03");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(result).rejects.toThrow("Input aborted by user");
    });
  });

  describe("TerminalInput component", () => {
    test("should handle input correctly", async () => {
      const onSubmit = mock();
      const onError = mock();

      const { stdin, lastFrame } = render(
        <TerminalInput message="Test message" onSubmit={onSubmit} onError={onError} />,
      );

      expect(lastFrame()).toMatchInlineSnapshot(
        `"\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m \x1B[7m \x1B[27m"`,
      );

      stdin.write("Hello, World!");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(
        `"\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m Hello, World!\x1B[7m \x1B[27m"`,
      );

      stdin.write("\r");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(
        `"\x1B[32m✔\x1B[39m \x1B[1mTest message\x1B[22m Hello, World!"`,
      );
      expect(onSubmit).toHaveBeenCalledWith("Hello, World!");
    });

    test("should handle multiline input correctly", async () => {
      const onSubmit = mock();
      const onError = mock();

      const { stdin, lastFrame } = render(
        <TerminalInput
          message="Test message"
          inline={false}
          onSubmit={onSubmit}
          onError={onError}
        />,
      );

      expect(lastFrame()).toMatchInlineSnapshot(
        `
          "\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m
            \x1B[7m \x1B[27m"
        `,
      );

      stdin.write("Hello");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(`
        "\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m
          Hello\x1B[7m \x1B[27m"
      `);

      // backspace
      stdin.write("\x7f");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(`
        "\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m
          Hell\x1B[7m \x1B[27m"
      `);

      // delete
      stdin.write("\x1b[3~");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(`
        "\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m
          Hel\x1B[7m \x1B[27m"
      `);

      // shift+return
      stdin.write("\n");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(`
        "\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m
          Hel
          \x1B[7m \x1B[27m"
      `);
      stdin.write("world!");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(`
        "\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m
          Hel
          world!\x1B[7m \x1B[27m"
      `);

      // move up
      stdin.write("\x1b[A");
      stdin.write("o");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(`
        "\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m
          Helo\x1B[7m \x1B[27m
          world!"
      `);

      // move left
      stdin.write("\x1b[D");
      stdin.write("l");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(`
        "\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m
          Hell\x1B[7mo\x1B[27m
          world!"
      `);

      // move right
      stdin.write("\x1b[C");
      stdin.write(",");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(`
        "\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m
          Hello,\x1B[7m \x1B[27m
          world!"
      `);

      // move home
      stdin.write("\x01");
      stdin.write("X ");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(`
        "\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m
          X \x1B[7mH\x1B[27mello,
          world!"
      `);

      // move end
      stdin.write("\x05");
      stdin.write("!");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(`
        "\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m
          X Hello,!\x1B[7m \x1B[27m
          world!"
      `);

      // move down
      stdin.write("\x1b[B");
      stdin.write("~");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(`
        "\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m
          X Hello,!
          world!~\x1B[7m \x1B[27m"
      `);

      // submit
      stdin.write("\r");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(`
        "\x1B[32m✔\x1B[39m \x1B[1mTest message\x1B[22m
          X Hello,!
          world!~"
      `);
      expect(onSubmit.mock.calls).toMatchInlineSnapshot(`
        [
          [
            
        "X Hello,!
        world!~"
        ,
          ],
        ]
      `);
    });

    test("should handle ctrl+c correctly", async () => {
      const onSubmit = mock();
      const onError = mock();

      const { stdin, lastFrame } = render(
        <TerminalInput message="Test message" onSubmit={onSubmit} onError={onError} />,
      );

      stdin.write("\x03");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(`"\x1B[31m✘\x1B[39m \x1B[1mTest message\x1B[22m"`);
      expect(onError.mock.calls).toMatchInlineSnapshot(`
        [
          [
            [ExitPromptError: Input aborted by user],
          ],
        ]
      `);
    });

    test("should handle validation correctly", async () => {
      const onSubmit = mock();
      const onError = mock();

      const { stdin, lastFrame } = render(
        <TerminalInput
          message="Test message"
          validate={(input) => {
            if (input !== "valid") {
              return `Input must be 'valid' but got '${input}'`;
            }
            return true;
          }}
          onSubmit={onSubmit}
          onError={onError}
        />,
      );

      expect(lastFrame()).toMatchInlineSnapshot(
        `"\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m \x1B[7m \x1B[27m"`,
      );

      stdin.write("vali");
      await new Promise((resolve) => setTimeout(resolve, 0));
      stdin.write("\r");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(lastFrame()).toMatchInlineSnapshot(
        `
          "\x1B[34m?\x1B[39m \x1B[1mTest message\x1B[22m vali\x1B[7m \x1B[27m
            \x1B[31mInput must be 'valid' but got 'vali'\x1B[39m"
        `,
      );

      stdin.write("d");
      await new Promise((resolve) => setTimeout(resolve, 0));
      stdin.write("\r");
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(lastFrame()).toMatchInlineSnapshot(
        `"\x1B[32m✔\x1B[39m \x1B[1mTest message\x1B[22m valid"`,
      );
      expect(onSubmit.mock.calls).toMatchInlineSnapshot(`
        [
          [
            "valid",
          ],
        ]
      `);
    });
  });
});
