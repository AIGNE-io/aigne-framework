import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { BlockletComponent, type SearchState } from "../../components/blocklet-comp.tsx";
import LiveSwitch from "../../components/live-switch.tsx";
import SwitchComponent from "../../components/switch.tsx";

const MobileSearch = ({
  handleSearchReset,
  handleSearchApply,
  toggleDrawer,
  components,
  search,
  setSearch,
  live,
  setLive,
}: {
  handleSearchReset: () => void;
  handleSearchApply: () => void;
  toggleDrawer: (open: boolean) => () => void;
  components: { data: string[] };
  search: SearchState;
  setSearch: (data: Partial<SearchState>) => void;
  onDateRangeChange: (dateRange: [Date, Date]) => void;
  live: boolean;
  setLive: (live: boolean) => void;
}) => {
  const { t } = useLocaleContext();
  const isBlocklet = !!window.blocklet?.prefix;

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterListIcon />
          <Typography variant="h6">{t("search")}</Typography>
        </Box>
        <IconButton onClick={toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
        {isBlocklet && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("component")}
            </Typography>
            <Autocomplete
              size="small"
              fullWidth
              options={components?.data || []}
              value={search.componentId || null}
              onChange={(_, value) => setSearch({ componentId: value ?? "" })}
              getOptionLabel={(option) => {
                if (!option) return "";
                const comp = window.blocklet.componentMountPoints?.find((c) => c.did === option);
                if (!comp) return "";
                return comp?.title ?? comp?.name ?? option;
              }}
              renderInput={(params) => <TextField {...params} placeholder={t("selectComponent")} />}
              renderOption={(props, option) => {
                const comp = window.blocklet.componentMountPoints?.find((c) => c.did === option);
                if (!comp) return null;

                return (
                  <Box component="li" {...props} key={option}>
                    <BlockletComponent component={comp} />
                  </Box>
                );
              }}
              clearOnEscape
              clearText={t("clear")}
              noOptionsText={t("noOptions")}
            />
          </Box>
        )}

        {/* <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t("dateRange")}
          </Typography>
          <CustomDateRangePicker value={search.dateRange} onChange={onDateRangeChange} />
        </Box> */}

        <Box sx={{ mb: 3 }}>
          <LiveSwitch live={live} setLive={setLive} />
        </Box>

        {!isBlocklet && (
          <Box sx={{ mb: 3 }}>
            <SwitchComponent
              checked={search.showImportedOnly ?? false}
              onChange={(checked) => setSearch({ showImportedOnly: checked })}
              label={t("showImportedOnly")}
            />
          </Box>
        )}
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          gap: 1,
        }}
      >
        <Button variant="outlined" fullWidth onClick={handleSearchReset} sx={{ flex: 1 }}>
          {t("reset")}
        </Button>
        <Button variant="contained" fullWidth onClick={handleSearchApply} sx={{ flex: 1 }}>
          {t("apply")}
        </Button>
      </Box>
    </Box>
  );
};
export default MobileSearch;
