import { ArrowDropDownRounded } from "@mui/icons-material";
import {
  CircularProgress,
  CssBaseline,
  GlobalStyles,
  ThemeProvider as MuiThemeProvider,
  Stack,
  type TextFieldProps,
  type ThemeOptions,
  alpha,
  createTheme,
  inputBaseClasses,
  useTheme,
} from "@mui/material";
import { type ReactNode, Suspense, useMemo } from "react";
import { Helmet } from "react-helmet";

import { useAgent } from "../contexts/Agent";
import { useEntryAgent } from "../contexts/EntryAgent";
import { chineseFonts } from "../utils/fonts";
import GlobalLoading from "./GlobalLoading";

export default function ThemeProvider({ children }: { children?: ReactNode }) {
  const { aid } = useEntryAgent();
  const agent = useAgent({ aid });
  const { appearance } = agent.project;
  const theme = useTheme();
  const bodyFontFamily = appearance?.typography?.fontFamily;
  const headingFontFamily = appearance?.typography?.heading?.fontFamily;

  const newTheme = useMemo(() => {
    let { primary, secondary } = theme.palette;

    try {
      if (appearance?.primaryColor) {
        primary = theme.palette.augmentColor({
          color: { main: appearance?.primaryColor },
        });
      }
    } catch (error) {
      console.error("augment primary color error", { error });
    }

    try {
      if (appearance?.secondaryColor) {
        secondary = theme.palette.augmentColor({
          color: { main: appearance?.secondaryColor },
        });
      }
    } catch (error) {
      console.error("augment secondary color error", { error });
    }

    const { fontFamily } = theme.typography;

    const headingFontFamily = [
      appearance?.typography?.heading?.fontFamily &&
        JSON.stringify(appearance?.typography?.heading?.fontFamily),
      fontFamily,
    ]
      .filter(Boolean)
      .join(",");

    const bodyFontFamily = [
      appearance?.typography?.fontFamily &&
        JSON.stringify(appearance?.typography?.fontFamily),
      fontFamily,
    ]
      .filter(Boolean)
      .join(",");

    const themeOptions: ThemeOptions = {
      components: {
        MuiSelect: {
          defaultProps: { IconComponent: ArrowDropDownRounded },
        },
        MuiTextField: {
          variants: [
            {
              props: {},
              style: ({ theme }) =>
                theme.unstable_sx({
                  ".MuiInputBase-root": {
                    fieldset: { borderColor: "grey.400" },
                    [`&.Mui-focused, :not(.${inputBaseClasses.disabled}):hover`]:
                      {
                        fieldset: {
                          border: "none",
                          boxShadow: `0px 0px 0px 4px ${alpha(
                            theme.palette.primary.main,
                            0.2,
                          )}, 0px 0px 0px 1px ${theme.palette.primary.main}`,
                        },
                      },
                  },
                  ".MuiInputLabel-root": {
                    [`&.Mui-focused, :not(.${inputBaseClasses.disabled}):hover, &.MuiFormLabel-filled`]:
                      {
                        backgroundColor: `${theme.palette.primary.main}`,
                        color: "white",
                        px: 1,
                        ml: -0.8,
                        py: 0.2,
                        mt: -0.1,
                        borderRadius: 4,
                      },
                  },
                }),
            },
            {
              props: { select: true },
              style: ({ theme, ...p }) => {
                const { placeholder } = p as TextFieldProps;

                return theme.unstable_sx({
                  "& .MuiSelect-select .notranslate::after": placeholder
                    ? {
                        content: `"${placeholder}"`,
                        opacity: 0.42,
                      }
                    : {},
                  "& .MuiFormLabel-root:not(.MuiInputLabel-shrink) + .MuiInputBase-root > .MuiSelect-select .notranslate::after":
                    {
                      opacity: 0,
                    },
                });
              },
            },
          ],
        },
        MuiListItemButton: {
          variants: [
            {
              props: {},
              style: ({ theme }) =>
                theme.unstable_sx({
                  fontSize: 13,
                  color: "#010714",
                }),
            },
          ],
        },
      },
    };

    const tempTheme = createTheme({
      typography: {
        fontFamily: bodyFontFamily,
        ...Object.fromEntries(
          new Array(5).fill(0).map((_, index) => [
            `h${index + 1}`,
            {
              fontFamily: headingFontFamily,
            },
          ]),
        ),
        button: {
          textTransform: "none",
        },
      } as any,
      palette: {
        primary,
        secondary,
      },
    });

    return createTheme(theme, themeOptions, {
      typography: tempTheme.typography,
      palette: {
        primary: tempTheme.palette.primary,
        secondary: tempTheme.palette.secondary,
        text: tempTheme.palette.text,
        background: {
          default: "#ffffff",
        },
      },
      shape: {
        borderRadius: 8,
      },
      shadows: [
        "none",
        "0px 0px 0px 1px rgba(2, 7, 19, 0.08), 0px 1px 2px -1px rgba(2, 7, 19, 0.08), 0px 2px 4px 0px rgba(2, 7, 19, 0.04)",
        "0px 0px 0px 1px rgba(2, 7, 19, 0.08), 0px 1px 2px -1px rgba(2, 7, 19, 0.08), 0px 2px 8px 0px rgba(2, 7, 19, 0.10)",
        ...tempTheme.shadows.slice(3),
      ],
    });
  }, [theme]);

  const fontUrls = useMemo(() => {
    const urls = [bodyFontFamily, headingFontFamily]
      .filter((i): i is NonNullable<typeof i> => !!i)
      .map(
        (font) =>
          chineseFonts.find((i) => i.value === font)?.link ||
          `https://fonts.googleapis.com/css?family=${font.replace(/ /g, "+")}`,
      );
    return [...new Set(urls)];
  }, [bodyFontFamily, headingFontFamily]);

  return (
    <MuiThemeProvider theme={newTheme}>
      <Helmet>
        {fontUrls.map((url) => (
          <link key={url} rel="stylesheet" href={url} />
        ))}
      </Helmet>

      <CssBaseline>
        <GlobalStyles
          styles={(theme) =>
            theme.unstable_sx({
              "h1,h2,h3,h4,h5": {
                fontFamily: `${theme.typography.h1.fontFamily} !important`,
              },
              body: {
                fontFamily: `${theme.typography.fontFamily} !important`,
              },
              ".page-header": {
                borderBottom: "1px solid rgba(229, 231, 235, 1)",
              },

              ".white-tooltip .MuiTooltip-tooltip": {
                background: "white !important",
                boxShadow: "0px 4px 8px 0px rgba(3, 7, 18, 0.08)",
                border: "1px solid rgba(229, 231, 235, 1)",
                padding: 4,
              },
            })
          }
        />
        <GlobalLoading
          sx={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100%",
            zIndex: "snackbar",
          }}
        />

        <Suspense
          fallback={
            <Stack flexGrow={1} alignItems="center" justifyContent="center">
              <CircularProgress size={24} />
            </Stack>
          }
        >
          {children}
        </Suspense>
      </CssBaseline>
    </MuiThemeProvider>
  );
}
