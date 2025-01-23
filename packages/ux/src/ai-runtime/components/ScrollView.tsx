import { Box, type BoxProps, Stack } from "@mui/material";
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";
import * as scrollToBottom from "react-scroll-to-bottom";
// @ts-ignore
import useInternalContext from "react-scroll-to-bottom/lib/esm/hooks/internal/useInternalContext";

// @ts-ignore
const Composer = scrollToBottom.Composer as typeof scrollToBottom.default;

const scrollViewContext = createContext<boolean | null>(null);

const useScrollViewContext = () => useContext(scrollViewContext);

export default function ScrollView({
  children,
  scroll = "element",
  component = Stack,
  initialScrollBehavior = "auto",
  ...props
}: BoxProps & {
  scroll?: "window" | "element";
  initialScrollBehavior?: ComponentProps<
    typeof Composer
  >["initialScrollBehavior"];
}) {
  const ctx = useScrollViewContext();

  // Skip scroll view if we are in a scroll view
  if (ctx) {
    return (
      <Box component={component} flexGrow={1} {...props}>
        {children}
      </Box>
    );
  }

  return (
    <scrollViewContext.Provider value>
      <Composer initialScrollBehavior={initialScrollBehavior}>
        <ScrollViewWithinWindow
          scroll={scroll}
          component={component}
          {...props}
        >
          {children}
        </ScrollViewWithinWindow>
      </Composer>
    </scrollViewContext.Provider>
  );
}

function ScrollViewWithinWindow({
  children,
  scroll,
  component,
  ...props
}: BoxProps & { scroll: "window" | "element" }) {
  const { setTarget } = useInternalContext();
  const ele = useFakeScrollElementOfWindow();

  useEffect(() => {
    if (scroll === "window") {
      setTarget(ele);
    }
  }, [scroll]);

  if (!component) return children;

  return (
    <Box
      component={component}
      {...props}
      ref={scroll === "element" ? setTarget : undefined}
      flexGrow={1}
      sx={{
        ...(scroll === "element"
          ? {
              flex: 1,
              height: "100%",
              overflow: "auto",
              overscrollBehavior: "contain",
            }
          : {}),
        ...props.sx,
      }}
    >
      {children}
    </Box>
  );
}

function useFakeScrollElementOfWindow() {
  return useMemo(() => {
    const e = document.scrollingElement as any;
    return new Proxy(e, {
      get: (_, p: string) => {
        if (p === "offsetHeight") return window.innerHeight;
        if (["addEventListener", "removeEventListener"].includes(p))
          return (window as any)[p].bind(window);
        const v = e[p];
        if (v instanceof Function) return v.bind(e);
        return v;
      },
      set: (_, p, v) => {
        e[p] = v;
        return true;
      },
    });
  }, []);
}
