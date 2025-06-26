import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import { Fragment } from "react";

function MessageCards({ messages }: { messages: { content: string; role: string }[] }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {messages.map((msg, index) => (
        <Fragment key={msg.content}>
          <Card variant="outlined" sx={{ backgroundColor: "#1e1e1e", border: "none" }}>
            <CardContent sx={{ paddingY: 1.5, paddingX: 2 }}>
              <Typography variant="h1" sx={{ color: "common.white", fontWeight: 500, mb: 2 }}>
                {msg.role}
              </Typography>

              <Typography
                variant="body2"
                sx={{ marginTop: 0.5, color: "common.white", whiteSpace: "break-spaces" }}
              >
                {msg.content}
              </Typography>
            </CardContent>
          </Card>

          {index !== messages.length - 1 && <Divider />}
        </Fragment>
      ))}
    </Box>
  );
}

const RenderView = ({ value }: { value: any }) => {
  if (value.messages && value.messages.length > 0) {
    return <MessageCards messages={value.messages} />;
  }

  return (
    <Box component="pre" sx={{ whiteSpace: "break-spaces", p: 2, m: 0 }}>
      {JSON.stringify(value, null, 2)}
    </Box>
  );
};

export default RenderView;
