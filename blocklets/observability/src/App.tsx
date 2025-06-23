import List from "@aigne/observability/list";
import { translations } from "@aigne/observability/translations";
import { ConfigProvider } from "@arcblock/ux/lib/Config";
import { ToastProvider } from "@arcblock/ux/lib/Toast";
import Dashboard from "@blocklet/ui-react/lib/Dashboard";
import { Box, CssBaseline } from "@mui/material";
import { get } from "lodash";
import { Suspense } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { SessionProvider } from "./contexts/session.js";

export default function BlockletApp() {
  const basename = window?.blocklet?.prefix || "/";

  return (
    <ConfigProvider translations={translations} prefer="system">
      <Router basename={basename}>
        <SessionProvider serviceHost={get(window, "blocklet.prefix", "/")}>
          <CssBaseline>
            <ToastProvider>
              <Suspense fallback={<Box>Loading...</Box>}>
                <Dashboard
                  meta={{}}
                  fallbackUrl="/"
                  invalidPathFallback="/"
                  headerAddons={null}
                  sessionManagerProps={{}}
                  links={[]}
                  showDomainWarningDialog={false}
                >
                  <WrappedApp />
                </Dashboard>
              </Suspense>
            </ToastProvider>
          </CssBaseline>
        </SessionProvider>
      </Router>
    </ConfigProvider>
  );
}

function WrappedApp() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Box sx={{ my: 3 }}>
            <List />
          </Box>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
