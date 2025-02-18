import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { Icon } from "@iconify/react";
import { Box, Stack, type StackProps, styled } from "@mui/material";
import { saveAs } from "file-saver";
import DOMPurify from "isomorphic-dompurify";
import { type ComponentType, useMemo } from "react";
import { getQuery, joinURL, withQuery } from "ufo";

import type {
  RuntimeOutputShare,
  RuntimeOutputVariablesSchema,
} from "@aigne/agent-v1";
import { RuntimeOutputVariable } from "@aigne/agent-v1/types";
import { AI_RUNTIME_DID } from "../../constants";
import { useAgent } from "../../contexts/Agent";
import { useCurrentAgent } from "../../contexts/CurrentAgent";
import { useCurrentMessage } from "../../contexts/CurrentMessage";
import { isValidInput } from "../../utils/agent-inputs";
import { convertImageToBlob, downloadImage } from "../../utils/download-image";
import { useSessionContext } from "../../utils/session";
import ActionButton from "../ActionButton";
import CommunityIcon from "./Community";

export default function ShareActions({ ...props }: StackProps) {
  const { aid } = useCurrentAgent();
  const agent = useAgent({ aid });
  const { message } = useCurrentMessage();

  const sharing = useMemo(
    () =>
      agent.outputVariables?.find((i) => i.name === RuntimeOutputVariable.share)
        ?.initialValue as RuntimeOutputShare | undefined,
    [agent],
  );

  const inputs = useMemo(
    () =>
      agent.parameters
        ?.filter(isValidInput)
        .map(
          (i) => [i.label?.trim() || i.key, message.inputs?.[i.key]] as const,
        )
        .filter((i) => i[1])
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n") || "",
    [agent.parameters, message.inputs],
  );

  const items = sharing?.items
    ?.map((item) => {
      const C = ShareActionsMap[item.to];
      if (!C) return null;

      return (
        <Box key={item.to}>
          <C
            inputs={inputs}
            shareAttach={{
              shareAttachInputs: sharing?.shareAttachInputs ?? false,
              shareAttachUrl: sharing?.shareAttachUrl ?? false,
            }}
          />
        </Box>
      );
    })
    .filter((i): i is NonNullable<typeof i> => !!i);

  if (!items?.length) return null;
  return <Stack {...props}>{items}</Stack>;
}

const ShareActionsMap: {
  [to: string]: ComponentType<{
    inputs: string;
    shareAttach: { shareAttachInputs: boolean; shareAttachUrl: boolean };
    params?: any[][];
  }>;
} = {
  twitter: ShareTwitter,
  copy: ShareCopy,
  saveAs: ShareSave,
  community: ShareCommunity,
  link: ShareLink,
};

function ShareTwitter({
  inputs,
  shareAttach,
}: {
  inputs: string;
  shareAttach: { shareAttachInputs: boolean; shareAttachUrl: boolean };
}) {
  const { t } = useLocaleContext();
  const { message } = useCurrentMessage();
  const { link } = useCurrentLink();

  const query = useMemo(() => {
    const content =
      message.outputs?.objects?.find((i) => i?.[RuntimeOutputVariable.text])?.[
        RuntimeOutputVariable.text
      ] ||
      message.outputs?.objects
        ?.find((i) => i?.[RuntimeOutputVariable.images]?.length)
        ?.[RuntimeOutputVariable.images]?.at(0)?.url;

    if (!content) return null;

    const texts: string[] = [];

    if (shareAttach.shareAttachInputs) {
      texts.push(inputs);
    }

    texts.push(content);

    let text = texts.join("\n\n");

    // 如果 content 长度超过 100，截断
    if (text.length > 250) {
      text = `${text.slice(0, 250)}...`;
    }

    return {
      text,
      url: link,
    };
  }, [message.outputs]);

  if (!query) return null;

  return (
    <StyledActionButton
      tip={t("socialShare.shareToX")}
      title={<Icon icon="tabler:brand-x" />}
      target="_blank"
      href={withQuery("https://twitter.com/intent/tweet", query)}
    />
  );
}

function ShareLink() {
  const { t } = useLocaleContext();
  const { link } = useCurrentLink();

  return (
    <StyledActionButton
      autoReset
      tip={t("socialShare.copyLink")}
      tipSucceed={t("copied")}
      title={<Icon icon="tabler:link" />}
      titleSucceed={<Icon icon="tabler:link-plus" />}
      onClick={async () => {
        if (link) {
          window.navigator.clipboard.writeText(link);
        }
      }}
    />
  );
}

function ShareCopy({
  inputs,
  shareAttach,
}: {
  inputs: string;
  shareAttach: { shareAttachInputs: boolean; shareAttachUrl: boolean };
}) {
  const { t } = useLocaleContext();
  const { message } = useCurrentMessage();
  const { link } = useCurrentLink();

  const content = message.outputs?.objects?.find(
    (i) => i?.[RuntimeOutputVariable.text],
  )?.[RuntimeOutputVariable.text];

  const image = message.outputs?.objects
    ?.find((i) => i?.[RuntimeOutputVariable.images]?.length)
    ?.[RuntimeOutputVariable.images]?.at(0)?.url;

  if (!content && !image) return null;

  return (
    <StyledActionButton
      autoReset
      tip={t("copy")}
      tipSucceed={t("copied")}
      title={<Icon icon="tabler:copy" />}
      titleSucceed={<Icon icon="tabler:copy-check" />}
      onClick={async () => {
        if (content) {
          const texts: string[] = [];

          if (shareAttach.shareAttachUrl && link) {
            texts.push(link);
          }

          if (shareAttach.shareAttachInputs) {
            texts.push(inputs);
          }

          texts.push(content);
          window.navigator.clipboard.writeText(
            texts.filter(Boolean).join("\n\n"),
          );
        } else if (image) {
          const imageBlob = await convertImageToBlob(
            await downloadImage({ url: image }),
          );
          window.navigator.clipboard.write([
            new ClipboardItem({ "image/png": imageBlob }),
          ]);
        }
      }}
    />
  );
}

function ShareSave({
  inputs,
  shareAttach,
}: {
  inputs: string;
  shareAttach: { shareAttachInputs: boolean; shareAttachUrl: boolean };
}) {
  const { t } = useLocaleContext();
  const { message } = useCurrentMessage();
  const filename = message.inputs?.question || message.id;
  const { link } = useCurrentLink();

  const content = message.outputs?.objects?.find(
    (i) => i?.[RuntimeOutputVariable.text],
  )?.[RuntimeOutputVariable.text];

  const image = message.outputs?.objects
    ?.find((i) => i?.[RuntimeOutputVariable.images]?.length)
    ?.[RuntimeOutputVariable.images]?.at(0)?.url;

  if (!content && !image) return null;

  return (
    <StyledActionButton
      tip={t("save")}
      tipSucceed={t("saved")}
      title={<Icon icon="tabler:file-download" />}
      titleSucceed={<Icon icon="tabler:file-check" />}
      onClick={async () => {
        // @ts-ignore
        const { default: html2pdf } = await import("html2pdf.js");
        if (content) {
          const element = document.createElement("div");

          if (shareAttach.shareAttachUrl) {
            element.innerHTML += `<p><a href="{${link}}">${link}</a></p>`;
          }

          if (shareAttach.shareAttachInputs) {
            element.innerHTML += `<p><blockquote>${DOMPurify.sanitize(inputs)}</blockquote></p>`;
          }

          element.innerHTML += `<p>${DOMPurify.sanitize(content)}</p>`;

          await html2pdf()
            .set({
              margin: 1,
              filename: `${filename}.pdf`,
              image: { type: "jpeg", quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
            })
            .from(element)
            .save();
        } else if (image) {
          saveAs(image, `${filename}.png`);
        }
      }}
    />
  );
}

function ShareCommunity({
  inputs,
  shareAttach,
}: {
  inputs: string;
  shareAttach: { shareAttachInputs: boolean; shareAttachUrl: boolean };
}) {
  const { t } = useLocaleContext();
  const { message } = useCurrentMessage();
  const { link } = useCurrentLink();

  const query = useMemo(() => {
    const text =
      message.outputs?.objects?.find((i) => i?.[RuntimeOutputVariable.text])?.[
        RuntimeOutputVariable.text
      ] ?? "";

    const images = (
      message.outputs?.objects?.find?.(
        (i) => i?.[RuntimeOutputVariable.images]?.length,
      )?.[
        RuntimeOutputVariable.images
      ] as RuntimeOutputVariablesSchema[RuntimeOutputVariable.images]
    )?.map((i: { url: string }) => i.url);

    let content = "";

    if (shareAttach.shareAttachUrl) {
      content += `[[]](${link})\n\n`;
    }

    if (shareAttach.shareAttachInputs) {
      content += `> ${inputs}\n\n`;
    }

    if (images) {
      content += images.map((image: string) => `![image](${image})`).join("\n");
    }

    content += text;

    return {
      boardId: "aigne",
      format: "markdown",
      title: `${message.inputs?.question || inputs}`,
      content,
      labels: "demo",
    };
  }, [inputs, message.outputs, shareAttach]);

  return (
    <StyledActionButton
      tip={t("socialShare.shareToCommunity")}
      title={<CommunityIcon />}
      target="_blank"
      href={withQuery("https://community.arcblock.io/discussions/add?", query)}
    />
  );
}

const StyledActionButton = styled(ActionButton)(({ theme }) =>
  theme.unstable_sx({
    fontSize: "inherit",
    p: 0.5,
    minWidth: "0 !important",
    minHeight: "0 !important",
  }),
);

const useCurrentLink = () => {
  const { session } = useSessionContext();
  const { message } = useCurrentMessage();
  const prefix = window.blocklet?.componentMountPoints.find(
    (i) => i.did === AI_RUNTIME_DID,
  )?.mountPoint;
  if (!prefix) {
    return { link: null };
  }
  const link = withQuery(
    joinURL(window.origin, prefix, "/messages", message.id),
    {
      agentUrl: withQuery(
        (getQuery(window.location.href).agentUrl as string) ||
          window.location.href,
        {
          inviter: session.user?.did,
        },
      ),
    },
  );

  return { link };
};
