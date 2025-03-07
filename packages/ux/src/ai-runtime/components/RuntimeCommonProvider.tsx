import { LocaleProvider, useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import Result from "@arcblock/ux/lib/Result";
import { Box } from "@mui/material";
import React, { type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { translations } from "../locales";

export default function RuntimeCommonProvider({ children }: { children?: ReactNode }) {
  return (
    <RuntimeLocaleProvider>
      <ErrorBoundary FallbackComponent={ErrorRender}>
        <React.Suspense>{children}</React.Suspense>
      </ErrorBoundary>
    </RuntimeLocaleProvider>
  );
}

function ErrorRender({ error }: { error: any }) {
  return (
    <Box
      component={Result}
      status={error.status || "error"}
      description={error.message}
      sx={{ bgcolor: "transparent", mt: "20%" }}
    />
  );
}

export function RuntimeLocaleProvider({ children }: { children?: ReactNode }) {
  const { locale } = useLocaleContext();

  return (
    <LocaleProvider translations={translations} locale={locale} fallbackLocale="en">
      {children}
    </LocaleProvider>
  );
}
