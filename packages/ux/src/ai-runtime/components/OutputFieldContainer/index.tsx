import { Icon } from "@iconify/react";
import { Box, Stack, type StackProps, Typography } from "@mui/material";
import { memo } from "react";

import type { OutputVariable } from "@aigne/agent-v1";

const OutputFieldContainer = memo(
  ({ output, ...props }: { output?: OutputVariable } & StackProps) => {
    return (
      <Stack gap={1} {...props}>
        {output?.appearance?.title && (
          <Typography
            component="h6"
            noWrap
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            {output.appearance.icon && <Box component={Icon} icon={output.appearance.icon} />}

            <Box component="span" sx={{ flex: 1, textOverflow: "hidden" }}>
              {output.appearance.title}
            </Box>
          </Typography>
        )}

        {props.children}
      </Stack>
    );
  },
);

export default OutputFieldContainer;
