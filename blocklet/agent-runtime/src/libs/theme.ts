import { create } from "@arcblock/ux/lib/Theme";

const theme = create({
  palette: {
    primary: {
      // light: 这将从 palette.primary.main 中进行计算，
      main: "#108cc6",
      // dark: 这将从 palette.primary.main 中进行计算，
      contrastText: "#fff",
    },
  },
  typography: {
    fontFamily: '"Lexend", sans-serif',
  },
});

export default theme;
