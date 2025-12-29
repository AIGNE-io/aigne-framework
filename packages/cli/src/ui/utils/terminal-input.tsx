import { ExitPromptError } from "@inquirer/core";
import chalk from "chalk";
import { Box, render, Text, useInput } from "ink";
import { useRef, useState } from "react";
import { useTextBuffer } from "./text-buffer.js";

export async function terminalInput({
  render: r = render,
  ...options
}: {
  message?: string;
  default?: string;
  inline?: boolean;
  required?: boolean;
  validate?: (input: string) => string | boolean | Promise<string | boolean>;
  render?: typeof render;
  clear?: boolean;
} = {}): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const handleSigInt = () => {
      reject(new Error("Input aborted"));
    };
    process.addListener("SIGINT", handleSigInt);
    const clean = () => process.removeListener("SIGINT", handleSigInt);

    const app = r(
      <TerminalInput
        {...options}
        onSubmit={(value) => {
          if (options.clear) app.clear();
          app.unmount();
          resolve(value);
          clean();
        }}
        onError={(error) => {
          if (options.clear) app.clear();
          app.unmount();
          reject(error);
          clean();
        }}
      />,
      { exitOnCtrlC: false },
    );
  });
}

export function TerminalInput(props: {
  message?: string;
  default?: string;
  inline?: boolean;
  required?: boolean;
  validate?: (input: string) => string | boolean | Promise<string | boolean>;
  onSubmit: (input: string) => void;
  onError: (error: Error) => void;
}) {
  const buffer = useTextBuffer({
    initialText: props.default || "",
    initialCursorOffset: props.default?.length || 0,
    isValidPath: () => false,
    viewport: { width: 80, height: 1 },
  });

  const textRef = useRef(buffer.text);

  textRef.current = buffer.text;

  const [status, setStatus] = useState<"input" | "success" | "error" | "validating">("input");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useInput((character, key) => {
    if (character === "c" && key.ctrl) {
      setStatus("error");
      setTimeout(() => {
        props.onError(new ExitPromptError("Input aborted by user"));
      });
      return;
    }
    if (key.return) {
      const input = textRef.current || props.default || "";
      setStatus("validating");
      setErrorMessage(undefined);

      // Handle validation
      const validateInput = async () => {
        try {
          // Check required validation first
          if (props.required && !input.trim()) {
            setErrorMessage("You must provide a value");
            setStatus("input");
            return;
          }

          // Run custom validation if provided
          if (props.validate) {
            const result = await props.validate(input);
            if (result !== true) {
              setErrorMessage(
                typeof result === "string" ? result : "You must provide a valid value",
              );
              setStatus("input");
              return;
            }
          }

          // Validation passed
          setStatus("success");
          setTimeout(() => {
            props.onSubmit(input);
          });
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : "Validation error");
          setStatus("input");
        }
      };

      validateInput();
      return;
    } else if (key.backspace) buffer.backspace();
    else if (key.delete) buffer.backspace();
    else if (key.downArrow) buffer.move("down");
    else if (key.upArrow) buffer.move("up");
    else if (key.leftArrow) buffer.move("left");
    else if (key.rightArrow) buffer.move("right");
    else if (character === "a" && key.ctrl) buffer.move("home");
    else if (character === "e" && key.ctrl) buffer.move("end");
    else {
      buffer.handleInput({ ...key, name: character, sequence: character, paste: false });
      setErrorMessage(undefined);
    }
  });

  const lines = [...buffer.lines];
  if (status === "input") {
    const [row, col] = buffer.cursor;
    const currentLine = lines[row] || "";
    lines[row] =
      currentLine.slice(0, col) +
      chalk.inverse(currentLine[col] || " ") +
      currentLine.slice(col + 1);
  }

  const label = props.message && chalk.bold(props.message);

  const inline = props.inline !== false;

  return (
    <Box flexDirection="column">
      <Box flexDirection={inline ? "row" : "column"}>
        <Text>
          {PREFIX[status]} {!inline && label}
        </Text>
        <Box flexShrink={1} flexGrow={1} marginLeft={inline ? 0 : 2} marginRight={1}>
          <Text>
            {!!label && inline && `${label} `}
            {lines.join("\n")}
          </Text>
        </Box>
      </Box>
      {errorMessage && (
        <Box marginLeft={2}>
          <Text color="red">{errorMessage}</Text>
        </Box>
      )}
    </Box>
  );
}

const PREFIX = {
  input: chalk.blue("?"),
  validating: chalk.yellow("⋯"),
  success: chalk.green("✔"),
  error: chalk.red("✘"),
};
