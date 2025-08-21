import { ConfigProvider } from "@arcblock/ux/lib/Config/index.js";
import { ErrorFallback } from "@arcblock/ux/lib/ErrorBoundary/index.js";
import { ThemeProvider } from "@arcblock/ux/lib/Theme/index.js";
import { CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
} from "react-router-dom";
// @ts-ignore
import "./app.css";
import Layout from "./components/layout.js";
import { SessionProvider } from "./contexts/session.js";
import theme from "./libs/theme.js";
import { translations } from "./locales/index.js";
import Chat from "./pages/chat.js";

const prefix = window?.blocklet?.prefix || "/";

function App() {
  const fallback = (
    <Box
      className="fallback-container"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );

  return (
    <Suspense fallback={fallback}>
      <ConfigProvider translations={translations} prefer="system">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={window.location.reload}
        >
          <CssBaseline />
          <Outlet />
        </ErrorBoundary>
      </ConfigProvider>
    </Suspense>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route
        path="/"
        element={
          <Layout>
            <Chat />
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>,
  ),
  {
    basename: prefix,
  },
);

export default function WrappedApp() {
  const basename = window?.blocklet?.prefix || "/";

  return (
    <ThemeProvider theme={theme as any} injectFirst>
      <SessionProvider serviceHost={basename}>
        <RouterProvider router={router} />
      </SessionProvider>
    </ThemeProvider>
  );
}
