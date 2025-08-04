import ThemeModeToggle from "@arcblock/ux/lib/Config/theme-mode-toggle";
import Dashboard from "@arcblock/ux/lib/Layout/dashboard";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import LocaleSelector from "@arcblock/ux/lib/Locale/selector";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import Box from "@mui/material/Box";
import { useMemo } from "react";

import Logo from "./icons/logo.svg?url";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useLocaleContext();

  const renderAddons = () => {
    const addonsArray = [];

    // 启用了多语言，且检测到了 locale context，且有多种语言可以切换
    addonsArray.push(<LocaleSelector key="locale-selector" showText={false} />);

    // 切换明暗主题
    addonsArray.push(<ThemeModeToggle key="theme-mode-toggle" />);

    return addonsArray;
  };

  const renderedAddons = renderAddons();
  const nodes = Array.isArray(renderedAddons) ? renderedAddons : [renderedAddons];

  const links = useMemo(() => {
    return [
      {
        url: "/",
        title: t("traces"),
        name: "traces",
        showBadge: false,
        icon: <ManageSearchIcon />,
      },
    ];
  }, [t]);

  return (
    <Dashboard
      links={links}
      title={t("dashboardTitle")}
      headerProps={{
        brand: t("dashboardTitle"),
        description: t("dashboardDescription"),
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
