import { ConfigProvider } from "@arcblock/ux/lib/Config";
import { ToastProvider } from "@arcblock/ux/lib/Toast";
import { Box, CssBaseline } from "@mui/material";
import { Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import Layout from "./layout.tsx";
import List from "./list.tsx";
import { translations } from "./locales/index.ts";

export default function App() {
  return (
    <ConfigProvider translations={translations} prefer="system">
      <CssBaseline>
        <ToastProvider>
          <Suspense fallback={<Box>Loading...</Box>}>
            <AppRoutes />
          </Suspense>
        </ToastProvider>
      </CssBaseline>
    </ConfigProvider>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={
        <Layout>
          <List />
        </Layout>
      }
    />,
  ),
  { basename: "/" },
);

function AppRoutes() {
  return <RouterProvider router={router} />;
}
