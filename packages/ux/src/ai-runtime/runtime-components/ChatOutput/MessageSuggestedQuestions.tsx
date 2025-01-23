import { Stack, Typography, type TypographyProps } from "@mui/material";

import type {
  RuntimeOutputVariable,
  RuntimeOutputVariablesSchema,
} from "@aigne/agent-v1";

export default function MessageSuggestedQuestions({
  dataSource,
  onClick,
}: {
  dataSource: RuntimeOutputVariablesSchema[RuntimeOutputVariable.suggestedQuestions];
  onClick?: (item: NonNullable<typeof dataSource>[number]) => void;
}) {
  const suggestedQuestions = dataSource;

  if (suggestedQuestions?.length) {
    return (
      <Stack gap={1}>
        {suggestedQuestions.map((item) => {
          return (
            <MessageSuggestedQuestion
              key={item.question}
              onClick={() => onClick?.(item)}
            >
              {item.question}
            </MessageSuggestedQuestion>
          );
        })}
      </Stack>
    );
  }

  return null;
}

export function MessageSuggestedQuestion({ ...props }: TypographyProps) {
  return (
    <Typography
      variant="subtitle2"
      {...props}
      sx={{
        display: "inline-block",
        border: 1,
        borderColor: "rgba(229, 231, 235, 1)",
        borderRadius: 1,
        py: 1,
        px: 2,
        // without logo width
        maxWidth: "calc(100% - 20px)",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "rgba(239, 246, 255, 1)",
        },
        ...props.sx,
      }}
    />
  );
}
