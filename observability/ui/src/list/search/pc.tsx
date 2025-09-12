import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import TrashIcon from "@mui/icons-material/Delete";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { BlockletComponent, type SearchState } from "../../components/blocklet-comp.tsx";
import CustomDateRangePicker from "../../components/date-picker.tsx";
import SwitchComponent from "../../components/switch.tsx";
import Delete from "../delete.tsx";

const PcSearch = ({
  components,
  search,
  setSearch,
  onDateRangeChange,
  live,
  setLive,
  fetchTraces,
  page,
}: {
  components: { data: string[] };
  search: SearchState;
  setSearch: (search: SearchState) => void;
  onDateRangeChange: (dateRange: [Date, Date]) => void;
  live: boolean;
  setLive: (live: boolean) => void;
  fetchTraces: (params: { page: number; pageSize: number }) => void;
  page: { page: number; pageSize: number };
}) => {
  const isBlocklet = !!window.blocklet?.prefix;
  const { t } = useLocaleContext();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      {isBlocklet && (
        <Autocomplete
          size="small"
          sx={{ minWidth: 240 }}
          options={components?.data || []}
          value={search.componentId || null}
          //@ts-ignore
          onChange={(_, value) => setSearch((x) => ({ ...x, componentId: value || "" }))}
          getOptionLabel={(option) => {
            if (!option) return "";
            const comp = window.blocklet.componentMountPoints?.find((c) => c.did === option);
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
      )}

      <Box key="date-picker" sx={{ mx: 1 }}>
        <CustomDateRangePicker value={search.dateRange} onChange={onDateRangeChange} />
      </Box>

      <Box sx={{ display: "flex" }}>
        <SwitchComponent live={live} setLive={setLive} />
      </Box>

      {!isBlocklet && (
        <IconButton onClick={() => setDialogOpen(true)}>
          <TrashIcon sx={{ color: "error.main" }} />
        </IconButton>
      )}

      {dialogOpen && (
        <Delete
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          fetchTraces={() => fetchTraces({ page: 0, pageSize: page.pageSize })}
        />
      )}
    </>
  );
};
export default PcSearch;
