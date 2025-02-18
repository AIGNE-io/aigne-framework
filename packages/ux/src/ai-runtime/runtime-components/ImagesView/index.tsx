import ImagePreview from "@blocklet/ai-kit/components/image-preview";
import { Skeleton } from "@mui/material";
import { useMemo } from "react";

import OutputFieldContainer from "../../components/OutputFieldContainer";
import {
  useCurrentMessage,
  useCurrentMessageOutput,
} from "../../contexts/CurrentMessage";

export type ImagesViewPropValue = Array<{ url: string }>;

export default function ImagesView() {
  const { message } = useCurrentMessage({ optional: true }) ?? {};
  const { outputValue, output } =
    useCurrentMessageOutput<ImagesViewPropValue>();

  const images = useMemo(
    () => outputValue.map((i) => ({ src: i.url })),
    [outputValue],
  );

  if (!images.length && !message?.loading) return null;

  return (
    <OutputFieldContainer
      output={output}
      sx={{
        ".lazy-image-wrapper": { borderRadius: 1, img: { borderRadius: 1 } },
      }}
    >
      {images.length ? (
        <ImagePreview dataSource={images} itemWidth={200} spacing={1} />
      ) : message?.loading ? (
        <Skeleton width={200} height={200} variant="rounded" />
      ) : null}
    </OutputFieldContainer>
  );
}
