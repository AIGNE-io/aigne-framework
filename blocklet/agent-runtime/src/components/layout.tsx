import SessionManager from "@arcblock/did-connect/lib/SessionManager";
import ThemeModeToggle from "@arcblock/ux/lib/Config/theme-mode-toggle";
import Dashboard from "@arcblock/ux/lib/Layout/dashboard";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import LocaleSelector from "@arcblock/ux/lib/Locale/selector";
import Box from "@mui/material/Box";
import { useMemo } from "react";
import Logo from "../assets/logo.png?url";
import { useSessionContext } from "../contexts/session.ts";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useLocaleContext();
  const { session } = useSessionContext();

  const renderAddons = () => {
    const addonsArray = [];

    addonsArray.push(<LocaleSelector key="locale-selector" showText={false} />);

    addonsArray.push(<ThemeModeToggle key="theme-mode-toggle" />);

    addonsArray.push(<SessionManager size={24} session={session} />);

    return addonsArray;
  };

  const renderedAddons = renderAddons();
  const nodes = Array.isArray(renderedAddons) ? renderedAddons : [renderedAddons];

  const links = useMemo(() => {
    return [];
  }, [t]);

  return (
    <Dashboard
      links={links}
      title={window.blocklet?.appName}
      headerProps={{
        brand: window.blocklet?.appName,
        description: window.blocklet?.appDescription,
        addons: nodes,
        logo: <Box component="img" src={Logo} alt="AIGNE" />,
      }}
      fullWidth
      legacy={false}
    >
      {children}
    </Dashboard>
  );
}
