import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import Switch from "@arcblock/ux/lib/Switch";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { joinURL } from "ufo";
import { origin } from "../utils/index.js";

const SwitchComponent = ({ ...props }: { live: boolean; setLive: (live: boolean) => void }) => {
  const { t } = useLocaleContext();
  const [loading, setLoading] = useState(false);
  const { live, setLive } = props;

  const fetchSettings = async () => {
    fetch(joinURL(origin, "/api/settings"))
      .then((res) => res.json() as Promise<{ data: { live: boolean } }>)
      .then(({ data }) => {
        setLive(data.live);
      });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLiveChange = async (checked: boolean) => {
    setLoading(true);

    try {
      await fetch(joinURL(origin, "/api/settings"), {
        method: "POST",
        body: JSON.stringify({ live: checked }),
        headers: { "Content-Type": "application/json" },
      });
      setLive(checked);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Switch
      disabled={loading}
      checked={live}
      onChange={(e) => handleLiveChange(e.target.checked)}
      color="primary"
      // @ts-ignore
      labelProps={{
        label: (
          <Box
            component="span"
            sx={{
              mr: 1,
              fontSize: 14,
              color: live ? "text.primary" : "text.hint",
              fontWeight: 400,
            }}
          >
            {live ? t("liveUpdatesOn") : t("liveUpdatesOff")}
          </Box>
        ),
        labelPlacement: "start",
        style: { margin: 0 },
      }}
    />
  );
};

export default SwitchComponent;
