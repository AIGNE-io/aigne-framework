import type { RuntimeOutputVariablesSchema } from "@aigne/agent-v1";
import { RuntimeOutputVariable } from "@aigne/agent-v1/types";
import ImagePreview from "@blocklet/ai-kit/components/image-preview";
import { Stack } from "@mui/material";
import { useMemo } from "react";
import ReferenceLinks from "./ReferenceLinks";

export default function MessageMetadataRenderer({
  object,
}: { object: RuntimeOutputVariablesSchema }) {
  const referenceLinks = object[RuntimeOutputVariable.referenceLinks];

  // 方便后续添加 metadata
  const formattedObject = useMemo(() => {
    const imagesList = object[RuntimeOutputVariable.images];
    const images = (
      Array.isArray(imagesList) ? imagesList.map((i) => ({ src: i.url })) : []
    ).filter((i) => typeof i.src === "string");
    return {
      images: images?.length ? images : undefined,
    };
  }, [object]);

  return (
    <>
      {Array.isArray(referenceLinks) && referenceLinks.length ? (
        <ReferenceLinks links={referenceLinks} />
      ) : undefined}

      {formattedObject?.images && (
        <Stack gap={1}>
          <ImagePreview dataSource={formattedObject.images} itemWidth={100} />
        </Stack>
      )}
    </>
  );
}
