import SessionManager from "@arcblock/did-connect/lib/SessionManager";
import ThemeModeToggle from "@arcblock/ux/lib/Config/theme-mode-toggle.js";
import LocaleSelector from "@arcblock/ux/lib/Locale/selector.js";
import Dashboard from "@blocklet/ui-react/lib/Dashboard";
import Header from "@blocklet/ui-react/lib/Header";
import { Box } from "@mui/material";
import { useMemo } from "react";
import Logo from "../assets/logo.png?url";
import { useSessionContext } from "../contexts/session.js";

const OBSERVABILITY_DID = "z2qa2GCqPJkufzqF98D8o7PWHrRRSHpYkNhEh";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { session } = useSessionContext();

  const renderAddons = (addonsArray: any = []) => {
    addonsArray.push(<LocaleSelector key="locale-selector" showText={false} />);

    addonsArray.push(<ThemeModeToggle key="theme-mode-toggle" />);

    addonsArray.push(<SessionManager size={24} session={session} />);

    return addonsArray;
  };

  const links = useMemo(() => {
    return [];
  }, []);

  const addons = renderAddons();

  const blockletInfo = {
    navigation: [
      {
        title: "Docs",
        link: "https://www.arcblock.io/docs/aigne-framework/zh/aigne-framework-getting-started-index-md",
      },
    ],
  };
  const componentMountPoints = window.blocklet?.componentMountPoints;
  const observability = componentMountPoints?.find((item) => item.did === OBSERVABILITY_DID);
  if (observability && ["admin", "owner"].includes(session?.role || "")) {
    blockletInfo.navigation.push({
      title: observability.title,
      link: observability.mountPoint,
    });
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header
        sx={{ position: "fixed", top: 0, left: 0, right: 0 }}
        brand={
          <Box sx={{ color: "text.primary", fontSize: 20, fontWeight: 600 }}>
            {window.blocklet?.appName}
          </Box>
        }
        description={window.blocklet?.appDescription}
        logo={
          window.blocklet?.logo ? (
            <img src={window.blocklet.logo} alt="logo" />
          ) : (
            <img src={Logo} alt="logo" />
          )
        }
        meta={blockletInfo}
        addons={renderAddons([])}
        showDomainWarningDialog={false}
      />

      <Dashboard
        meta={blockletInfo}
        headerAddons={addons}
        headerProps={{ style: { display: "none" } }}
        links={links}
        title={blocklet?.appName}
      >
        {children}
      </Dashboard>
    </Box>
  );
}
