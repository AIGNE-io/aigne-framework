import { Box, Typography } from "@mui/material";
import { useMemo } from "react";

import MarkdownRenderer from "../../components/MarkdownRenderer";
import { useAgent } from "../../contexts/Agent";
import { useCurrentAgent } from "../../contexts/CurrentAgent";
import { useCurrentMessage } from "../../contexts/CurrentMessage";
import { isValidInput } from "../../utils/agent-inputs";

export default function UserMessageView() {
  const { message } = useCurrentMessage();
  const agent = useAgent({ aid: useCurrentAgent().aid });

  const params = useMemo(() => {
    const inputs = agent.parameters
      ?.filter(isValidInput)
      .map((i) => [i.label?.trim() || i.key, message.inputs?.[i.key]] as const)
      .filter((i) => i[1]);
    const q = inputs?.find((i) => i[0] === "question");
    return q ? [q] : inputs;
  }, [agent.parameters, message.inputs]);

  if (params?.length === 1) {
    return <MarkdownRenderer>{params[0]?.[1]}</MarkdownRenderer>;
  }

  return params?.map(([key, value]) => (
    <Typography key={key} sx={{ wordWrap: "break-word" }}>
      <Box component="span" sx={{ color: "text.secondary" }}>
        {key}
      </Box>
      &nbsp;&nbsp;
      <span>{value}</span>
    </Typography>
  ));
}
