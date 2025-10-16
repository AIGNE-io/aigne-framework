import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState } from "react";
import { joinURL } from "ufo";
import { origin } from "../utils/index.ts";
import SwitchComponent from "./switch.tsx";

interface LiveSwitchProps {
  live: boolean;
  setLive: (live: boolean) => void;
}

const LiveSwitch = ({ live, setLive }: LiveSwitchProps) => {
  const { t } = useLocaleContext();
  const [liveLoading, setLiveLoading] = useState(false);

  const fetchSettings = async () => {
    fetch(joinURL(origin, "/api/settings"))
      .then((res) => res.json() as Promise<{ data: { live: boolean } }>)
      .then(({ data }) => {
        setLive(data.live);
      });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLiveChange = async (checked: boolean) => {
    setLiveLoading(true);

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
      setLiveLoading(false);
    }
  };

  return (
    <Tooltip title={t("toggleLive")}>
      <SwitchComponent
        checked={live}
        onChange={handleLiveChange}
        label={live ? t("liveUpdatesOn") : t("liveUpdatesOff")}
        disabled={liveLoading}
      />
    </Tooltip>
  );
};

export default LiveSwitch;
