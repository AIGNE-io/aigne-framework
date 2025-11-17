import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import TrashIcon from "@mui/icons-material/Delete";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import { BlockletComponent, type SearchState } from "../../components/blocklet-comp.tsx";
import CustomDateRangePicker from "../../components/date-picker.tsx";
import LiveSwitch from "../../components/live-switch.tsx";
import SwitchComponent from "../../components/switch.tsx";
import Delete from "../delete.tsx";
import Upload from "../upload.tsx";

const PcSearch = ({
  components,
  search,
  setSearch,
  onDateRangeChange,
  live,
  setLive,
  fetchTraces,
  page,
  setLoading,
}: {
  components: { data: string[] };
  search: SearchState;
  setSearch: (data: Partial<SearchState>) => void;
  onDateRangeChange: (dateRange: [Date, Date]) => void;
  live: boolean;
  setLive: (live: boolean) => void;
  fetchTraces: (params: { page: number; pageSize: number }) => void;
  page: { page: number; pageSize: number };
  setLoading: (loading: boolean) => void;
}) => {
  const isBlocklet = !!window.blocklet?.prefix;
  const { t } = useLocaleContext();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      {isBlocklet && (
        <Autocomplete
          size="small"
          sx={{
            minWidth: 160,
            maxWidth: 240,
            width: 1,
            fontSize: 13,
            "& .MuiInputBase-root": {
              height: 36,
              fontSize: 13,
            },
            "& .MuiAutocomplete-option": {
              fontSize: 13,
            },
          }}
          options={components?.data || []}
          value={search.componentId || null}
          onChange={(_, value) => setSearch({ componentId: value ?? "" })}
          getOptionLabel={(option) => {
            if (!option) return t("allComponents");
            const comp = window.blocklet.componentMountPoints?.find((c) => c.did === option);
            return comp?.title ?? comp?.name ?? option;
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t("selectComponent") || t("allComponents")}
              size="small"
            />
          )}
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
      )}

      <CustomDateRangePicker value={search.dateRange} onChange={onDateRangeChange} />

      <LiveSwitch live={live} setLive={setLive} />

      {!isBlocklet && (
        <SwitchComponent
          checked={search.showImportedOnly ?? false}
          onChange={(checked) => setSearch({ showImportedOnly: checked })}
          label={t("showImportedOnly")}
        />
      )}

      {!isBlocklet && <Upload fetchTraces={fetchTraces} pageSize={page.pageSize} />}

      {!isBlocklet && (
        <Tooltip title={t("deleteAll")}>
          <IconButton onClick={() => setDialogOpen(true)} size="small">
            <TrashIcon sx={{ color: "error.main" }} />
          </IconButton>
        </Tooltip>
      )}

      {dialogOpen && (
        <Delete
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          setLoading={setLoading}
          fetchTraces={() => fetchTraces({ page: 0, pageSize: page.pageSize })}
        />
      )}
    </>
  );
};
export default PcSearch;
