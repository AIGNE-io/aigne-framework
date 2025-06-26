import {
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import dayjs from "dayjs";

export const origin =
  window.blocklet?.prefix ??
  (process.env.NODE_ENV === "development" ? "http://localhost:7890" : "");

export const formatLocale = (locale = "en") => {
  if (locale === "tw") {
    return "zh";
  }

  return locale;
};

export function formatToDate(date: Date, locale = "en") {
  if (!date) {
    return "-";
  }

  return dayjs(date).locale(formatLocale(locale)).format("ll");
}

export const getDefaultRanges = (date: Date, locale?: any, t?: any) => [
  {
    label: t("thisWeek"),
    startDate: startOfWeek(date, { locale }),
    endDate: endOfWeek(date, { locale }),
  },
  {
    label: t("lastWeek"),
    startDate: startOfWeek(addWeeks(date, -1), { locale }),
    endDate: endOfWeek(addWeeks(date, -1), { locale }),
  },
  {
    label: t("last7Days"),
    startDate: addWeeks(date, -1),
    endDate: date,
  },
  {
    label: t("thisMonth"),
    startDate: startOfMonth(date),
    endDate: endOfMonth(date),
  },
  {
    label: t("lastMonth"),
    startDate: startOfMonth(addMonths(date, -1)),
    endDate: endOfMonth(addMonths(date, -1)),
  },
  {
    label: t("thisYear"),
    startDate: startOfYear(date),
    endDate: endOfYear(date),
  },
  {
    label: t("lastYear"),
    startDate: startOfYear(addYears(date, -1)),
    endDate: endOfYear(addYears(date, -1)),
  },
];
