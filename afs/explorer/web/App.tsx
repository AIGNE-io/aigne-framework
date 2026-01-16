import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { FileExplorer } from "./components/FileExplorer.tsx";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/*" element={<FileExplorer />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
