import {ConfigProvider} from "@arcblock/ux/lib/Config"
import {ToastProvider} from "@arcblock/ux/lib/Toast"
import {Box, CssBaseline} from "@mui/material"
import {Suspense} from "react"
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom"

import Layout from "./layout.js"
import List from "./list.js"
import {translations} from "./locales/index.js"

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
  )
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
    />
  ),
  {basename: "/"}
)

function AppRoutes() {
  return <RouterProvider router={router} />
}
