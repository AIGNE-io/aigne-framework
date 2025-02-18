import MarkdownRenderer from "../../components/MarkdownRenderer";
import OutputFieldContainer from "../../components/OutputFieldContainer";
import { useCurrentMessageOutput } from "../../contexts/CurrentMessage";
import { useOpeningMessage } from "../../hooks/use-appearances";

export default function OpeningQuestionsView() {
  const { output } = useCurrentMessageOutput();

  const opening = useOpeningMessage();

  if (!opening?.message) return null;

  return (
    <OutputFieldContainer output={output}>
      <MarkdownRenderer>{opening?.message}</MarkdownRenderer>
    </OutputFieldContainer>
  );
}
