import OutputFieldContainer from "../../components/OutputFieldContainer";
import ShareActions from "../../components/ShareActions";
import { useCurrentMessage, useCurrentMessageOutput } from "../../contexts/CurrentMessage";

export default function ShareView() {
  const { output } = useCurrentMessageOutput();
  const message = useCurrentMessage({ optional: true });

  if (message?.message.loading) return null;

  return (
    <OutputFieldContainer output={output}>
      <ShareActions flexDirection="row" justifyContent="flex-end" />
    </OutputFieldContainer>
  );
}
