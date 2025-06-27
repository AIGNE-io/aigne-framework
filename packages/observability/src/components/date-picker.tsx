import dayjs from "@abtnode/util/lib/dayjs";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import Toast from "@arcblock/ux/lib/Toast";
import { Button, Popover, Typography } from "@mui/material";
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
      <Typography ref={ref} component="div" color="text.secondary" mb={0}>
        <Button onClick={onTriggerClick} variant="outlined" size="small" color="inherit">
          {formatToDate(value[0], locale)} - {formatToDate(value[1], locale)}
        </Button>
      </Typography>

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
