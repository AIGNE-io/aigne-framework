import {
  Tooltip,
  type TooltipProps,
  styled,
  tooltipClasses,
} from "@mui/material";

const TransparentTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "transparent",
    boxShadow: "none",
  },
}));

export default TransparentTooltip;
