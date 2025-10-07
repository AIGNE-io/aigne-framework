import { ConfigProvider } from "@arcblock/ux/lib/Config";
import { ToastProvider } from "@arcblock/ux/lib/Toast";
import { Box, CssBaseline } from "@mui/material";
import { Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from "react-router-dom";

import Layout from "./layout.tsx";
import List from "./list/index.tsx";
import { translations } from "./locales/index.ts";
import Overview from "./overview.tsx";

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
    <Route path="/" element={<Outlet />}>
      <Route
        path="/"
        element={
          <Layout>
            <Overview />
          </Layout>
        }
      />
      <Route
        path="/traces"
        element={
          <Layout>
            <List />
          </Layout>
        }
      />
      ,
    </Route>,
  ),
  { basename: "/" },
);

function AppRoutes() {
  return <RouterProvider router={router} />;
}
