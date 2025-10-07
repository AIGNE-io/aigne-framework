import chalk from "chalk";
import { Box, render, Text, useInput } from "ink";
import { useState } from "react";
import { SIGINTError } from "./error.js";
import { useTextBuffer } from "./text-buffer.js";

export async function terminalInput(
  options: { message?: string; default?: string; inline?: boolean } = {},
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    process.addListener("SIGINT", () => {
      reject(new Error("Input aborted"));
    });

    const app = render(
      <Input
        {...options}
        onSubmit={(value) => {
          app.unmount();
          resolve(value);
        }}
        onError={(error) => {
          app.unmount();
          reject(error);
        }}
      />,
      { exitOnCtrlC: false },
    );
  });
}

function Input(props: {
  message?: string;
  default?: string;
  inline?: boolean;
  onSubmit: (input: string) => void;
  onError: (error: Error) => void;
}) {
  const buffer = useTextBuffer({
    initialText: props.default || "",
    initialCursorOffset: props.default?.length || 0,
    isValidPath: () => false,
    viewport: { width: 80, height: 1 },
  });

  const [status, setStatus] = useState<"input" | "success" | "error">("input");

  useInput((character, key) => {
    if (character === "c" && key.ctrl) {
      setStatus("error");
      setTimeout(() => {
        props.onError(new SIGINTError("Input aborted by user"));
      });
      return;
    }
    if (key.return) {
      setStatus("success");
      setTimeout(() => {
        props.onSubmit(buffer.text);
      });
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
  );
}

const PREFIX = {
  input: chalk.blue("?"),
  success: chalk.green("✔"),
  error: chalk.red("✘"),
};
