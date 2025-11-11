import Footer from "@blocklet/ui-react/lib/Footer";
import Header from "@blocklet/ui-react/lib/Header";
import { Box } from "@mui/material";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* @ts-ignore */}
      <Header />

      <Box sx={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {children}
      </Box>

      {/* @ts-ignore */}
      <Footer />
    </Box>
  );
}
