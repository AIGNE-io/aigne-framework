import { List, ListItemButton, listItemButtonClasses } from "@mui/material";
import { useState } from "react";

import OutputFieldContainer from "../../components/OutputFieldContainer";
import { useCurrentAgent } from "../../contexts/CurrentAgent";
import { useCurrentMessageOutput } from "../../contexts/CurrentMessage";
import { useSession } from "../../contexts/Session";
import { useOpeningQuestions } from "../../hooks/use-appearances";

export default function OpeningQuestionsView() {
  const { output } = useCurrentMessageOutput();

  const { aid } = useCurrentAgent();
  const runAgent = useSession((s) => s.runAgent);

  const opening = useOpeningQuestions();

  const [submitting, setSubmitting] = useState(false);

  if (!opening?.questions.length) return null;

  return (
    <OutputFieldContainer output={output}>
      <List
        disablePadding
        sx={{
          [`.${listItemButtonClasses.root}`]: {
            border: 1,
            borderColor: "grey.200",
            borderRadius: 1,
            my: 1,
          },
        }}
      >
        {opening.questions.map((item) => {
          return (
            <ListItemButton
              key={item.id}
              onClick={async () => {
                if (submitting) return;
                try {
                  setSubmitting(true);
                  await runAgent({
                    aid,
                    inputs: {
                      ...item.parameters,
                      question: item.parameters.question || item.title,
                    },
                  });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {item.title}
            </ListItemButton>
          );
        })}
      </List>
    </OutputFieldContainer>
  );
}
