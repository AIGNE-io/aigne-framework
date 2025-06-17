import Dashboard from "@arcblock/ux/lib/Layout/dashboard"
import LocaleSelector from "@arcblock/ux/lib/Locale/selector"
import ThemeModeToggle from "@arcblock/ux/lib/Config/theme-mode-toggle"
import ManageSearchIcon from "@mui/icons-material/ManageSearch"

const links = [
  {
    url: "/",
    title: "Trace",
    name: "trace",
    showBadge: false,
    icon: <ManageSearchIcon />,
  },
]

export default function Layout({children}: {children: React.ReactNode}) {
  const renderAddons = () => {
    let addonsArray = []

    // 启用了多语言，且检测到了 locale context，且有多种语言可以切换
    addonsArray.push(<LocaleSelector key="locale-selector" showText={false} />)

    // 切换明暗主题
    addonsArray.push(<ThemeModeToggle key="theme-mode-toggle" />)

    return addonsArray
  }

  const renderedAddons = renderAddons()
  const nodes = Array.isArray(renderedAddons) ? renderedAddons : [renderedAddons]

  return (
    <Dashboard
      links={links}
      title="Trace Dashboard"
      headerProps={{
        brand: "Trace Dashboard",
        addons: nodes,
      }}
      fullWidth
      legacy={false}>
      {children}
    </Dashboard>
  )
}
