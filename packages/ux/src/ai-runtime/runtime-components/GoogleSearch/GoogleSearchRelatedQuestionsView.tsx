import { Divider, List, ListItemButton } from "@mui/material";
import React, { useState } from "react";

import OutputFieldContainer from "../../components/OutputFieldContainer";
import { useCurrentAgent } from "../../contexts/CurrentAgent";
import {
  useCurrentMessage,
  useCurrentMessageOutput,
} from "../../contexts/CurrentMessage";
import { useSession } from "../../contexts/Session";

export type GoogleSearchRelatedViewPropValue = Array<{
  question: string;
  link: string;
  snippet?: string;
  title: string;
}>;

export default function GoogleSearchRelatedView({
  onlyLastMessage,
}: { onlyLastMessage?: boolean }) {
  const { aid } = useCurrentAgent();
  const { message } = useCurrentMessage({ optional: true }) ?? {};

  const { outputValue, output } =
    useCurrentMessageOutput<GoogleSearchRelatedViewPropValue>();

  const { lastMessageId, runAgent } = useSession((s) => ({
    lastMessageId: s?.messages?.at(0)?.id,
    runAgent: s.runAgent,
  }));

  const isLastMessage = !!message && message?.id === lastMessageId;

  const [submitting, setSubmitting] = useState(false);

  if (message?.loading) return null;

  if ((!isLastMessage && onlyLastMessage) || !outputValue.length) return null;

  return (
    <OutputFieldContainer output={output}>
      <List dense disablePadding>
        {outputValue.map((item) => (
          <React.Fragment key={item.title}>
            <ListItemButton
              sx={{ py: 1, px: 2 }}
              onClick={async () => {
                if (submitting) return;
                setSubmitting(true);
                try {
                  await runAgent({ aid, inputs: { question: item.question } });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {item.question}
            </ListItemButton>

            <Divider />
          </React.Fragment>
        ))}
      </List>
    </OutputFieldContainer>
  );
}
