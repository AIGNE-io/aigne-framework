import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import MemoryIcon from "@mui/icons-material/Memory";
import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import Decimal from "decimal.js";

function toPlainString(val: number) {
  const d = new Decimal(val);

  if (Math.abs(d.toNumber()) < 1 && d.toNumber() !== 0) {
    const match = d.toString().match(/e-(\d+)/);
    if (match) {
      return d.toFixed(Number(match[1]));
    }

    return d.toString();
  }

  return d.toString();
}

export default function ModelInfoTip({ modelInfo }: { modelInfo: any }) {
  const { t } = useLocaleContext();

  const supportsMap = {
    supports_function_calling: t("models.functionCalling"),
    supports_tool_choice: t("models.toolChoice"),
  };

  const supports = Object.entries(modelInfo)
    .map(([key, value]) => {
      if (key.startsWith("supports_") && value && supportsMap[key as keyof typeof supportsMap]) {
        return supportsMap[key as keyof typeof supportsMap];
      }

      return null;
    })
    .map((item) => item);

  return (
    <>
      <Box
        component={Stack}
        sx={{
          gap: 1.5,
          p: 1
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1
          }}>
          <MemoryIcon color="primary" />
          <Typography variant="h6">{t("models.details")}</Typography>
        </Box>

        <Divider />
        <Typography variant="body2">
          • {t("models.mode")}: {modelInfo.model}
        </Typography>
        <Typography variant="body2">
          • {t("models.maxInputTokens")}: {modelInfo.max_input_tokens}
        </Typography>
        <Typography variant="body2">
          • {t("models.maxOutputTokens")}: {modelInfo.max_output_tokens}
        </Typography>
        <Typography variant="body2">
          • {t("models.inputCostPerToken")}: $
          {toPlainString(modelInfo.input_cost_per_token).toString()}
        </Typography>
        <Typography variant="body2">
          • {t("models.outputCostPerToken")}: $
          {toPlainString(modelInfo.output_cost_per_token).toString()}
        </Typography>
        <Typography variant="body2">
          • {t("models.provider")}: {modelInfo.litellm_provider}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          <Typography variant="body2">• {t("models.supports")}:</Typography>
          {supports.filter(Boolean).map((item) => (
            <Chip key={item} label={item} size="small" sx={{ fontSize: 12 }} />
          ))}
        </Box>
      </Box>
    </>
  );
}
