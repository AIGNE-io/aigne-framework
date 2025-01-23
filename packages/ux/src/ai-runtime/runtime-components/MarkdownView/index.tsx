import { RuntimeOutputVariable } from "@aigne/agent-v1/types";
import { cx } from "@emotion/css";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import OutputFieldContainer from "../../components/OutputFieldContainer";
import {
  useCurrentMessage,
  useCurrentMessageOutput,
} from "../../contexts/CurrentMessage";

export default function MarkdownView({
  fontSize,
}: { fontSize?: string | number }) {
  const { outputValue, output } = useCurrentMessageOutput<string | undefined>();

  const writing =
    useCurrentMessage().message.loading &&
    output.name === RuntimeOutputVariable.text;

  return (
    <OutputFieldContainer output={output}>
      <MarkdownRenderer
        className={cx(writing && "writing")}
        sx={{
          fontSize:
            typeof fontSize === "string" && /^\d+$/.test(fontSize)
              ? Number(fontSize)
              : fontSize,
        }}
      >
        {outputValue}
      </MarkdownRenderer>
    </OutputFieldContainer>
  );
}
