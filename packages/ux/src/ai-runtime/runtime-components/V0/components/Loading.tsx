import { Box, type BoxProps, CircularProgress, Skeleton } from "@mui/material";

export default function Loading(props: BoxProps) {
  const { sx, ...restProps } = props;
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        ...sx,
      }}
      {...restProps}
    >
      <CircularProgress size={24} />
    </Box>
  );
}

export function AIRunningLoading(props: BoxProps) {
  const { sx, ...restProps } = props;
  const animationTimeList = [
    {
      time: 2,
      width: 60,
      height: 60,
      extraProps: {
        variant: "circular",
        sx: {
          backgroundColor: "grey.200",
        },
      },
    },
    {
      time: 3,
      width: 100,
      height: 20,
      extraProps: {
        sx: {
          backgroundColor: "grey.100",
        },
      },
    },

    {
      time: 2,
      width: 250,
      height: 10,
      extraProps: {
        sx: {
          backgroundColor: "grey.200",
        },
      },
    },
    {
      time: 4,
      width: 150,
      height: 10,
      extraProps: {
        sx: {
          backgroundColor: "grey.200",
        },
      },
    },
    {
      time: 8,
      width: "100%",
      height: "100%",
      Component: Box,
      extraProps: {
        children: [
          <Skeleton
            key={1}
            variant="rectangular"
            sx={{
              width: 60,
              height: 50,
              borderRadius: 1,
              backgroundColor: "grey.200",
            }}
          />,
          <Skeleton
            key={2}
            variant="rectangular"
            sx={{
              width: 90,
              height: 50,
              borderRadius: 1,
              backgroundColor: "grey.200",
            }}
          />,
          <Skeleton
            key={3}
            variant="rectangular"
            sx={{
              width: 120,
              height: 50,
              borderRadius: 1,
              backgroundColor: "grey.200",
            }}
          />,
        ],
        sx: {
          px: 2,
          py: 1,
          display: "flex",
          gap: 1.5,
          justifyContent: "space-between",
          overflow: "hidden",
        },
      },
    },
    {
      time: 60,
      width: 290,
      height: 150,
      extraProps: {
        sx: {
          backgroundColor: "grey.200",
        },
      },
    },
  ];
  return (
    <Box
      sx={{
        flex: 1,
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        flexDirection: "column",
        gap: 1.5,
        width: "100%",
        overflow: "hidden",
        "@keyframes loading": {
          "0%": {
            transform: "translateY(-8px) scaleX(1.3)",
            opacity: 0,
            height: "100%",
          },
          "50%": {
            transform: "translateY(0px)",
            opacity: 0.5,
            zoom: 1,
            height: "100%",
          },
          "100%": {
            transform: "translateY(4px)",
            opacity: 1,
            zoom: 1,
            height: "100%",
          },
        },
        ...sx,
      }}
      {...restProps}
    >
      {/* appear time list */}
      {animationTimeList.map((item, index) => {
        // 计算 index 之前的累计时间之和，作为动画延迟时间
        const delay = animationTimeList
          .slice(0, index)
          .reduce((prev, current) => prev + current.time, 0);
        const {
          time,
          width,
          height,
          Component = Skeleton,
          extraProps: { sx, ...restSkeletonProps } = {},
        } = item;
        const isLast = index === animationTimeList.length - 1;
        return (
          <Box
            key={index}
            sx={{
              animation: `loading ${time}s 1 ${delay}s forwards`,
              borderRadius: 1,
              overflow: "hidden",
              opacity: 0,
              transition: "all 0.3s",
            }}
          >
            {/* @ts-ignore */}
            <Component
              // @ts-ignore
              variant="rectangular"
              sx={{
                width,
                height,
                animationIterationCount: isLast ? "infinite" : 1,
                animationFillMode: isLast ? "forwards" : "none",
                ...sx,
              }}
              {...restSkeletonProps}
            />
          </Box>
        );
      })}
    </Box>
  );
}
