import { Box } from "@mui/material";
import { motion } from "framer-motion";

function TypingIndicator() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        py: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              width: 4,
              height: 4,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: "50%",
            }}
            animate={{
              y: [0, -4, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default TypingIndicator;
