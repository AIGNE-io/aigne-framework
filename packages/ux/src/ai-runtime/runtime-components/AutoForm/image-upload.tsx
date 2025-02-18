import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import Toast from "@arcblock/ux/lib/Toast";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CancelIcon from "@mui/icons-material/Cancel";
import ImageIcon from "@mui/icons-material/Image";
import { Box, Button, IconButton, Stack } from "@mui/material";
import { useRef } from "react";
import { type Control, Controller } from "react-hook-form";
import { withQuery } from "ufo";

import type { ImageParameter } from "@aigne/agent-v1";
import { uploadImage } from "../../api/image";

interface ImageUploadProps {
  control: Control<any>;
  parameter: ImageParameter;
  isInInput?: boolean;
}

const MAX_IMAGE_FILES = window.blocklet?.preferences?.maxImageCount || 1;

export function ImageUpload({
  control,
  parameter,
  isInInput,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLocaleContext();

  return (
    <Controller
      control={control}
      name={parameter.key!}
      render={({ field }) => {
        const handleFiles = async (files: File[]) => {
          const old = field.value || [];

          if (parameter.multiple) {
            if (old.length + files.length > MAX_IMAGE_FILES) {
              Toast.error(t("maxFilesLimit", { limit: MAX_IMAGE_FILES }));
              return;
            }
          }

          try {
            const formData = new FormData();
            files.forEach((file) => formData.append("images", file));

            const response = await uploadImage({ input: formData });
            const urls = Array.isArray(old) ? old : [old];

            field.onChange({
              target: {
                value: parameter.multiple
                  ? [
                      ...urls,
                      ...(
                        (response.uploads || []) as unknown as { url: string }[]
                      ).map((upload) => upload.url),
                    ]
                  : response.uploads[0]?.url,
              },
            });
          } catch (error) {
            console.error("error", error);
            Toast.error(error.message);
          }
        };

        const list = (
          Array.isArray(field.value) ? field.value : [field.value]
        ).filter(Boolean);
        return (
          <>
            <input
              type="file"
              accept="image/*"
              multiple={Boolean(parameter.multiple)}
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={(e) => handleFiles(Array.from(e.target.files || []))}
            />

            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple={Boolean(parameter.multiple)}
              style={{ display: "none" }}
              ref={cameraInputRef}
              onChange={(e) => handleFiles(Array.from(e.target.files || []))}
            />

            <Stack flexDirection="row" gap={0}>
              <IconButton
                onClick={() => cameraInputRef.current?.click()}
                disabled={list.length >= MAX_IMAGE_FILES}
                sx={{ display: { xs: "block", md: "none" } }}
              >
                <CameraAltIcon sx={{ fontSize: !isInInput ? 20 : 18 }} />
              </IconButton>

              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={list.length >= MAX_IMAGE_FILES}
              >
                <ImageIcon sx={{ fontSize: !isInInput ? 20 : 18 }} />
              </IconButton>
            </Stack>
          </>
        );
      }}
    />
  );
}

interface ImagePreviewProps {
  value: string | string[];
  parameter: ImageParameter;
  onRemove: (index: number) => void;
}

export function ImagePreview({
  value,
  parameter,
  onRemove,
}: ImagePreviewProps) {
  const list = (Array.isArray(value) ? value : [value]).filter(Boolean);
  if (!list.length || !parameter) return null;

  return (
    <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
      {list.map((url, index) => (
        <Box key={url} position="relative" display="flex">
          <img
            src={withQuery(url, {
              imageFilter: "resize",
              f: "webp",
              w: 200,
            })}
            alt={`Uploaded ${index + 1}`}
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
          <Button
            size="small"
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              minWidth: "unset",
              p: 0.5,
            }}
            onClick={() => onRemove(index)}
          >
            <CancelIcon style={{ color: "red" }} />
          </Button>
        </Box>
      ))}
    </Stack>
  );
}
