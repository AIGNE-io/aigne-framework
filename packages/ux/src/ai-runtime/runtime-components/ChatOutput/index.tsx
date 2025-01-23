import { useMemo } from "react";

import { useCurrentMessage } from "../../contexts/CurrentMessage";
import MessageItemView from "./MessageItemView";

// default hideAvatar to true, only show message when polish agent layout
export default function ChatOutput({
  hideAvatar = true,
  renderType,
}: {
  hideAvatar: boolean;
  renderType?: "parameters" | "result";
}) {
  const { message } = useCurrentMessage();

  const formattedMessage = useMemo(() => {
    if (renderType) {
      return Object.assign({}, message, {
        result: renderType === "parameters" ? {} : message.outputs,
        parameters: renderType === "result" ? {} : message.inputs,
      });
    }

    return message;
  }, [message, renderType]);

  return <MessageItemView message={formattedMessage} hideAvatar={hideAvatar} />;
}
