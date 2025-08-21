import { Box } from "@mui/material";
import React, { useEffect } from "react";

export default function TextLoading({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = React.useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setLoading((prev) => {
        if (prev.length < 3) {
          return `${prev}.`;
        }
        return "";
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box component="span">
      {children}
      {loading}
    </Box>
  );
}
