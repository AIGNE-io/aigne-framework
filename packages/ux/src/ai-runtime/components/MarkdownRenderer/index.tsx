import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { Icon } from "@iconify/react";
import { Box, Stack, styled } from "@mui/material";
import React, { type ComponentProps, type ReactElement, type ReactNode, Suspense } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import ActionButton from "../ActionButton";

const ReactSyntaxHighlighter = React.lazy(() =>
  import("react-syntax-highlighter").then((m) => ({ default: m.Prism })),
);

const MarkdownRenderer = styled((props: ComponentProps<typeof Markdown>) => (
  <Markdown
    {...props}
    remarkPlugins={[remarkGfm]}
    components={{
      pre: MarkdownPre,
      table: ({ className, children }) => {
        return (
          <Box sx={{ overflow: "auto", my: 1 }}>
            <table className={className}>{children}</table>
          </Box>
        );
      },
    }}
  />
))`
  width: 100%;
  overflow: hidden;
  word-break: break-word;

  > * {
    &:first-child /* emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason */ {
      margin-top: 0;
    }
    &:last-child /* emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason */ {
      margin-bottom: 0;
    }
  }

  pre {
    overflow: auto;
  }

  li {
    margin: 0;
    padding: 0;
  }

  li p {
    display: inline-block;
    vertical-align: top;
    margin: 0;
    padding: 0;
  }

  table {
    border-collapse: collapse;
    white-space: nowrap;

    th,
    td {
      border: 1px solid grey;
      padding: 4px 8px;
    }
  }

  a {
    color: ${({ theme }) => theme.palette.primary.main};

    :hover {
      text-decoration: underline;
    }
  }

  &.writing:empty,
  &.writing > *:last-child {
    &:after {
      content: '';
      display: inline-block;
      vertical-align: middle;
      height: 1.2em;
      margin-top: -0.2em;
      margin-left: 0.1em;
      border-right: 0.2em solid orange;
      border-radius: 10px;
      animation: blink-caret 0.75s step-end infinite;

      @keyframes blink-caret {
        from,
        to {
          border-color: transparent;
        }
        50% {
          border-color: ${({ theme }) => theme.palette.secondary.main};
        }
      }
    }
  }
`;

export default MarkdownRenderer;

function MarkdownPre({ children, ...props }: { children?: ReactNode }) {
  const { t } = useLocaleContext();

  const childrenProps = (children as ReactElement)?.props;

  if (!(childrenProps as any)?.children) return null;

  const match = /language-(\w+)/.exec((childrenProps as any).className || "");
  const language = match?.[1];

  return (
    <Box
      component="div"
      sx={{
        fontSize: 14,
        borderRadius: 1,
        bgcolor: "rgb(245, 242, 240)",
        "> pre": { mt: "0 !important" },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        p={0.5}
        pl={1.5}
        borderBottom={1}
        borderColor="grey.200"
      >
        <Box>{language}</Box>

        <Box flex={1} />

        <ActionButton
          autoReset
          tip={t("copyToClipboard")}
          tipSucceed={t("copied")}
          title={<Icon icon="tabler:copy" />}
          titleSucceed={<Icon icon="tabler:copy-check" />}
          sx={{ minWidth: 32, minHeight: 32, p: 0, fontSize: 18 }}
          onClick={() => {
            window.navigator.clipboard.writeText((childrenProps as any).children);
          }}
        />
      </Stack>

      <Suspense>
        <Box
          component={ReactSyntaxHighlighter}
          language={match?.[1]}
          {...props}
          sx={{ borderRadius: 1, bgcolor: "red" }}
        >
          {String((childrenProps as any).children).replace(/\n$/, "")}
        </Box>
      </Suspense>
    </Box>
  );
}
