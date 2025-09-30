import chalk from "chalk";
import { render, Text, useInput } from "ink";
import { SIGINTError } from "./error.js";
import { useTextBuffer } from "./text-buffer.js";

export async function terminalInput(
  options: { message?: string; default?: string } = {},
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    process.addListener("SIGINT", () => {
      reject(new Error("Input aborted"));
    });

    const app = render(
      <Input
        {...options}
        onSubmit={(value) => {
          app.clear();
          app.unmount();
          console.log(`${options.message} ${value}`); // echo the input back to terminal
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
  onSubmit: (input: string) => void;
  onError: (error: Error) => void;
}) {
  const buffer = useTextBuffer({
    initialText: props.default || "",
    isValidPath: () => false,
    viewport: { width: 80, height: 1 },
  });

  useInput((character, key) => {
    if (character === "c" && key.ctrl) {
      props.onError(new SIGINTError("Input aborted by user"));
      return;
    }
    if (key.return) {
      props.onSubmit(buffer.text);
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
  const [row, col] = buffer.cursor;
  const currentLine = lines[row] || "";
  lines[row] =
    currentLine.slice(0, col) + chalk.inverse(currentLine[col] || " ") + currentLine.slice(col + 1);

  return (
    <Text>
      {props.message} {lines.join("\n")}
    </Text>
  );
}
