import Avatar from "@arcblock/ux/lib/Avatar";
import ClickToCopy, { CopyButton } from "@arcblock/ux/lib/ClickToCopy";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { Box, Tooltip, Typography } from "@mui/material";

import { useSessionContext } from "../../../utils/session";
import { getLineClamp } from "../utils";

const BASE_QUESTION_SX = {
  fontWeight: 500,
  fontSize: 13,
};

export default function UserQuestion({ question }: { question?: string }) {
  const { session: authSession } = useSessionContext();
  const { user } = authSession;
  const { locale } = useLocaleContext();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {authSession?.user?.did && (
        <Box
          className="user"
          sx={{
            width: 30,
            height: 30,
          }}
        >
          <Avatar
            size={30}
            did={user?.did!}
            variant="circle"
            shape="circle"
            // @ts-ignore
            src={user?.avatar}
          />
        </Box>
      )}
      <Box
        className="question"
        sx={{
          padding: "6px 12px",
          borderRadius: 1,
          //   borderTopLeftRadius: 0,
          backgroundColor: "grey.200",
          maxWidth: 300,
        }}
      >
        {/* @ts-ignore */}
        <CopyButton
          locale={locale}
          render={({ copyButton, containerRef }: any) => {
            return (
              <Box
                ref={containerRef}
                display="flex"
                alignItems="center"
                sx={{
                  ...BASE_QUESTION_SX,
                  color: "textColor",
                }}
              >
                {/* @ts-ignore */}
                <ClickToCopy
                  locale={locale}
                  unstyled
                  disableHoverListener
                  disableFocusListener
                  disableTouchListener
                >
                  <Tooltip
                    placement="bottom"
                    arrow
                    title={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            ...BASE_QUESTION_SX,
                            color: "white",
                          }}
                        >
                          {question}
                        </Typography>
                        <Box
                          id="copy-button-wrapper"
                          component="span"
                          sx={{
                            ml: 0.5,
                            mt: 0.25,
                            fontSize: 14,
                          }}
                        >
                          {copyButton}
                        </Box>
                      </Box>
                    }
                  >
                    <Typography
                      sx={{
                        ...BASE_QUESTION_SX,
                        textAlign: "left",
                        alignItems: "center",
                        ...getLineClamp(1),
                      }}
                    >
                      {question}
                    </Typography>
                  </Tooltip>
                </ClickToCopy>
              </Box>
            );
          }}
        />
      </Box>
    </Box>
  );
}
