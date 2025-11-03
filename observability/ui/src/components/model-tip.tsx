import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import MemoryIcon from "@mui/icons-material/Memory";
import { Box, Divider, Stack, Typography } from "@mui/material";
import Decimal from "decimal.js";
import type { ModelPrice } from "../libs/index.ts";

function toPlainString(val: number = 0) {
  const d = new Decimal(val);

  const pricePerMillionTokens = d.mul(1000000);

  if (Math.abs(pricePerMillionTokens.toNumber()) < 1 && pricePerMillionTokens.toNumber() !== 0) {
    const match = pricePerMillionTokens.toString().match(/e-(\d+)/);
    if (match) {
      return pricePerMillionTokens.toFixed(Number(match[1]));
    }

    return pricePerMillionTokens.toString();
  }

  return pricePerMillionTokens.toString();
}

export default function ModelInfoTip({ modelInfo }: { modelInfo: ModelPrice }) {
  const { t } = useLocaleContext();
  const mode = modelInfo.mode || "chat";

  const renderCostInfo = () => {
    switch (mode) {
      case "image_generation":
        return (
          <>
            {modelInfo.output_cost_per_image !== undefined && (
              <Typography variant="body2">
                • Output Cost Per Image: ${modelInfo.output_cost_per_image}
              </Typography>
            )}
            {modelInfo.input_cost_per_pixel !== undefined && (
              <Typography variant="body2">
                • Input Cost Per Pixel: ${modelInfo.input_cost_per_pixel}
              </Typography>
            )}
            {modelInfo.output_cost_per_pixel !== undefined && (
              <Typography variant="body2">
                • Output Cost Per Pixel: ${modelInfo.output_cost_per_pixel}
              </Typography>
            )}
          </>
        );

      case "video_generation":
        return (
          <>
            {modelInfo.output_cost_per_video_per_second !== undefined && (
              <Typography variant="body2">
                • Output Cost Per Video Second: ${modelInfo.output_cost_per_video_per_second}
              </Typography>
            )}
          </>
        );
      default:
        return (
          <>
            {modelInfo.input_cost_per_token !== undefined && (
              <Typography variant="body2">
                • {t("models.inputCostPerToken")}: $
                {t("models.costPerTokenPerMillion", {
                  cost: toPlainString(modelInfo.input_cost_per_token).toString(),
                })}
              </Typography>
            )}
            {modelInfo.output_cost_per_token !== undefined && (
              <Typography variant="body2">
                • {t("models.outputCostPerToken")}: $
                {t("models.costPerTokenPerMillion", {
                  cost: toPlainString(modelInfo.output_cost_per_token).toString(),
                })}
              </Typography>
            )}
            {modelInfo.output_cost_per_reasoning_token !== undefined && (
              <Typography variant="body2">
                • Output Cost Per Reasoning Token: $
                {t("models.costPerTokenPerMillion", {
                  cost: toPlainString(modelInfo.output_cost_per_reasoning_token).toString(),
                })}
              </Typography>
            )}
            {modelInfo.input_cost_per_audio_token !== undefined && (
              <Typography variant="body2">
                • Input Cost Per Audio Token: $
                {t("models.costPerTokenPerMillion", {
                  cost: toPlainString(modelInfo.input_cost_per_audio_token).toString(),
                })}
              </Typography>
            )}
          </>
        );
    }
  };

  return (
    <Box component={Stack} sx={{ gap: 1.5, p: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <MemoryIcon color="primary" />
        <Typography variant="h6">{t("models.details")}</Typography>
      </Box>

      <Divider />

      <Typography variant="body2">• Model: {modelInfo.model}</Typography>

      {modelInfo.max_input_tokens !== undefined && (
        <Typography variant="body2">
          • {t("models.maxInputTokens")}: {modelInfo.max_input_tokens}
        </Typography>
      )}

      {modelInfo.max_output_tokens !== undefined && (
        <Typography variant="body2">
          • {t("models.maxOutputTokens")}: {modelInfo.max_output_tokens}
        </Typography>
      )}

      {renderCostInfo()}

      <Typography variant="body2">
        • {t("models.provider")}: {modelInfo.litellm_provider}
      </Typography>
    </Box>
  );
}
