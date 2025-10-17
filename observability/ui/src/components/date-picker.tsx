import dayjs from "@abtnode/util/lib/dayjs";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import Toast from "@arcblock/ux/lib/Toast";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { Box, Popover } from "@mui/material";
import { type DateRange, DateRangePicker } from "mui-daterange-picker";
import { useCallback, useRef, useState } from "react";
import { formatToDate, getDefaultRanges } from "../utils/index.ts";

interface CustomDateRangePickerProps {
  value: [Date, Date];
  onChange?: (range: [Date, Date]) => void;
}

export default function CustomDateRangePicker({ value, onChange }: CustomDateRangePickerProps) {
  const { locale, t } = useLocaleContext();
  const ref = useRef<HTMLDivElement>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const onTriggerClick = useCallback(() => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      setAnchorEl(ref.current);
    }
  }, [anchorEl]);

  const onDateChange = useCallback(
    (range: DateRange) => {
      if (!range.startDate || !range.endDate) {
        Toast.error("Please select a date range");
        return;
      }

      if (
        dayjs(range.startDate).isAfter(range.endDate) ||
        !dayjs(range.startDate).isValid() ||
        !dayjs(range.endDate).isValid()
      ) {
        Toast.error("Invalid date range");
        return;
      }

      onChange?.([range.startDate, range.endDate]);
      setAnchorEl(null);
    },
    [onChange],
  );

  return (
    <>
      <Box
        ref={ref}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          px: 1.5,
          py: 0.5,
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          minHeight: 36,
        }}
        onClick={onTriggerClick}
      >
        <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        <Box component="span" sx={{ fontSize: 13, color: "text.primary", fontWeight: 400 }}>
          {formatToDate(value[0], locale)} - {formatToDate(value[1], locale)}
        </Box>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <DateRangePicker
          open
          initialDateRange={{
            startDate: value[0],
            endDate: value[1],
          }}
          toggle={onTriggerClick}
          definedRanges={getDefaultRanges(dayjs().toDate(), locale, t)}
          onChange={onDateChange}
        />
      </Popover>
    </>
  );
}
