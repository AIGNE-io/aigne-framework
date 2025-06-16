import {LocaleProvider} from "@arcblock/ux/lib/Locale/context"
import {ToastProvider} from "@arcblock/ux/lib/Toast"
import {Box, CssBaseline, ThemeProvider} from "@mui/material"
import {Suspense} from "react"
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom"

import {translations} from "./locales/index.ts"

import {createTheme} from "@mui/material/styles"
import List from "./list.tsx"

const theme = createTheme({})
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <ToastProvider>
          <LocaleProvider
            translations={translations}
            fallbackLocale="en"
            locale={undefined}
            onLoadingTranslation={undefined}
            languages={undefined}>
            <Suspense fallback={<Box>Loading...</Box>}>
              <AppRoutes />
            </Suspense>
          </LocaleProvider>
        </ToastProvider>
      </CssBaseline>
    </ThemeProvider>
  )
}

const router = createBrowserRouter(
  createRoutesFromElements(<Route path="/" element={<List />} />),
  {basename: "/"}
)

function AppRoutes() {
  return <RouterProvider router={router} />
}
