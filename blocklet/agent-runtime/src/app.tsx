import { ErrorFallback } from "@arcblock/ux/lib/ErrorBoundary";
import { LocaleProvider } from "@arcblock/ux/lib/Locale/context";
import { ThemeProvider } from "@arcblock/ux/lib/Theme";
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

import "./app.css";
import { SessionProvider } from "./contexts/session.ts";
import theme from "./libs/theme.ts";
import { translations } from "./locales/index.tsx";
import Chat from "./pages/chat.tsx";

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
        backgroundColor: "#1F1F24",
      }}
    >
      <CircularProgress />
    </Box>
  );

  return (
    <Suspense fallback={fallback}>
      <LocaleProvider translations={translations} fallbackLocale="en">
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={window.location.reload}>
          <CssBaseline />
          <Outlet />
        </ErrorBoundary>
      </LocaleProvider>
    </Suspense>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/" element={<Chat />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>,
  ),
  {
    basename: prefix,
  },
);

export default function WrappedApp() {
  // While the blocklet is deploy to a sub path, this will be work properly.
  const basename = window?.blocklet?.prefix || "/";

  return (
    <ThemeProvider theme={theme as any} injectFirst>
      <SessionProvider serviceHost={basename}>
        <RouterProvider router={router} />
      </SessionProvider>
    </ThemeProvider>
  );
}
