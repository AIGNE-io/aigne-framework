import Datatable from "@arcblock/ux/lib/Datatable";
import Confirm from "@arcblock/ux/lib/Dialog/confirm";
import Empty from "@arcblock/ux/lib/Empty";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import RelativeTime from "@arcblock/ux/lib/RelativeTime";
import UserCard from "@arcblock/ux/lib/UserCard";
import { CardType, InfoType } from "@arcblock/ux/lib/UserCard/types";
import TrashIcon from "@mui/icons-material/Delete";
import { useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import { compact } from "lodash";
import prettyMs from "pretty-ms";
import { useState } from "react";
import { BlockletComponent } from "../components/blocklet-comp.tsx";
import type { TraceData } from "../components/run/types.ts";
import Status from "../components/status.tsx";
import formatNumber from "../utils/format-number.ts";
import { parseDuration } from "../utils/latency.ts";

const Table = ({
  traces,
  total,
  loading,
  onRowClick,
  page,
  setPage,
  isLive,
  onDelete,
  selectedRows,
  setSelectedRows,
}: {
  traces: TraceData[];
  total: number;
  loading: boolean;
  onRowClick: (row: TraceData) => void;
  page: { page: number; pageSize: number };
  setPage: (page: { page: number; pageSize: number }) => void;
  isLive?: boolean;
  onDelete: (item: string[]) => void;
  selectedRows: string[];
  setSelectedRows: (rows: string[]) => void;
}) => {
  const isBlocklet = !!window.blocklet?.prefix;
  const { t, locale } = useLocaleContext();
  const isMobile = useMediaQuery((x) => x.breakpoints.down("md"));
  const [open, setOpen] = useState<boolean>(false);

  const columns = compact([
    {
      label: "ID",
      name: "id",
      width: 160,
      options: {
        customBodyRender: (value: string) => <Box>{value}</Box>,
      },
    },
    {
      label: t("agentName"),
      name: "name",
      minWidth: 150,
      options: {
        customBodyRender: (value: string) => <Box>{value}</Box>,
      },
    },
    {
      label: t("input"),
      name: "input",
      minWidth: 120,
      options: {
        customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
          const item = traces[rowIndex];
          const input = item.attributes?.input;
          return (
            <Box
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 240,
              }}
            >
              {typeof input === "string" ? input : input ? JSON.stringify(input) : "-"}
            </Box>
          );
        },
      },
    },
    {
      label: t("output"),
      name: "output",
      options: {
        customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
          const item = traces[rowIndex];
          const output = item.attributes?.output;
          return (
            <Box
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 240,
              }}
            >
              {typeof output === "string" ? output : output ? JSON.stringify(output) : "-"}
            </Box>
          );
        },
      },
    },
    {
      label: t("latency"),
      name: "latency",
      align: "right" as const,
      width: 160,
      options: {
        customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
          const item = traces[rowIndex];
          if (item?.endTime && item?.startTime) {
            return <Box>{prettyMs(item.endTime - item.startTime)}</Box>;
          }

          return <Box>{parseDuration(item.startTime, item.endTime)}</Box>;
        },
      },
    },
    {
      label: `${t("token")}`,
      name: "token",
      width: 200,
      align: "right" as const,
      options: {
        customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
          const item = traces[rowIndex];
          return <Box>{`${formatNumber(item.token || 0, locale)}`}</Box>;
        },
      },
    },
    {
      label: `${t("cost")}`,
      name: "token",
      width: 200,
      align: "right" as const,
      options: {
        customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
          const item = traces[rowIndex];
          return <Box>{`$${Number(item.cost || 0).toFixed(6)}`}</Box>;
        },
      },
    },
    {
      label: t("status"),
      name: "status",
      minWidth: 150,
      align: "center" as const,
      options: {
        customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
          const item = traces[rowIndex];
          const map: Record<
            number,
            { color: "default" | "error" | "warning" | "success"; label: string }
          > = {
            0: {
              color: "warning",
              label: t("pending"),
            },
            1: {
              color: "success",
              label: t("success"),
            },
            2: {
              color: "error",
              label: t("failed"),
            },
          };

          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: isMobile ? "flex-start" : "center",
                gap: 1,
                width: isMobile ? 200 : undefined,
              }}
            >
              {item.status?.code === 0 ? (
                <Status />
              ) : isMobile ? null : (
                <Box sx={{ width: 6, height: 6, borderRadius: "50%" }} />
              )}

              <Chip
                label={map[item.status?.code as keyof typeof map]?.label ?? t("unknown")}
                size="small"
                color={map[item.status?.code as keyof typeof map]?.color ?? "default"}
                variant="outlined"
                sx={{ height: 21 }}
              />
            </Box>
          );
        },
      },
    },
    isBlocklet
      ? {
          label: t("user"),
          name: "userId",
          width: 100,
          options: {
            customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
              const item = traces[rowIndex];
              if (item.userId) {
                return (
                  <Box
                    sx={{
                      my: 0.5,
                      span: { display: "flex", alignItems: "center", fontSize: 12 },
                      width: 200,
                      overflow: isMobile ? "hidden" : undefined,
                    }}
                  >
                    <UserCard
                      avatarSize={36}
                      showDid={!isMobile}
                      did={item.userId}
                      cardType={CardType.Detailed}
                      infoType={InfoType.Minimal}
                      sx={{ border: 0, padding: 0 }}
                    />
                  </Box>
                );
              }
              return null;
            },
          },
        }
      : undefined,
    {
      label: t("startedAt"),
      name: "startTime",
      minWidth: 180,
      align: "right" as const,
      options: {
        customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
          const item = traces[rowIndex];
          return item.startTime ? (
            <RelativeTime value={item.startTime} type="absolute" format="YYYY-MM-DD HH:mm:ss" />
          ) : (
            "-"
          );
        },
      },
    },
    {
      label: t("endedAt"),
      name: "endTime",
      minWidth: 180,
      align: "right" as const,
      options: {
        customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
          const item = traces[rowIndex];
          return item.endTime ? (
            <RelativeTime value={item.endTime} type="absolute" format="YYYY-MM-DD HH:mm:ss" />
          ) : (
            "-"
          );
        },
      },
    },
  ]);

  if (isBlocklet) {
    columns.unshift({
      label: t("component"),
      name: "component",
      minWidth: 180,
      options: {
        customBodyRender: (_: unknown, { rowIndex }: { rowIndex: number }) => {
          const item = traces[rowIndex];
          if (!item.componentId) return <Box>-</Box>;

          const component = window.blocklet.componentMountPoints?.find(
            (c) => c.did === item.componentId,
          );

          if (!component) return <Box>-</Box>;

          return <BlockletComponent component={component} />;
        },
      },
    });
  }

  const onTableChange = ({ page: newPage, rowsPerPage }: { page: number; rowsPerPage: number }) => {
    setPage({ page: newPage + 1, pageSize: rowsPerPage });
  };

  const onClose = () => {
    setOpen(false);
    setSelectedRows([]);
  };

  const customToolbarSelect = (_selectedRows: { data: { index: number; dataIndex: number }[] }) => {
    if (!_selectedRows.data.length) return null;

    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton onClick={() => setOpen(true)}>
          <TrashIcon sx={{ color: "error.main" }} />
        </IconButton>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        ".MuiTableRow-root": isMobile
          ? {
              borderWidth: "1px",
              borderColor: "divider",
              padding: "6px 0px !important",
            }
          : {},
        td: isMobile
          ? {
              padding: "0",
              paddingTop: "16px",

              "&:last-of-type": {
                paddingBottom: "16px",
              },
            }
          : {},
        ".MuiTableCell-body": isMobile
          ? {
              alignItems: "center",

              ">div:first-of-type": {
                width: "100px !important",
              },
            }
          : {},
        ".MuiPaper-elevation1": {
          paddingTop: "16px",
          paddingBottom: "16px",
        },
      }}
    >
      <Datatable
        data={traces}
        columns={columns}
        loading={loading}
        options={{
          sort: false,
          download: false,
          filter: false,
          print: false,
          viewColumns: false,
          search: false,
          page: page.page - 1,
          rowsPerPage: page.pageSize,
          count: total,
          pagination: !isLive,
          rowsPerPageOptions: [10, 20, 50, 100],
          onRowClick(_rowData: string[], rowMeta: { dataIndex: number; rowIndex: number }) {
            const item = traces[rowMeta.dataIndex];
            onRowClick(item);
          },

          selectableRows: !isBlocklet ? "multiple" : "none",
          filterType: "checkbox",
          onRowSelectionChange: (_: unknown, __: unknown, rowsSelected: any) => {
            const ids = rowsSelected.map((idx: number) => traces[idx].id);
            setSelectedRows(ids);
          },
          rowsSelected: traces
            .map((row, idx) => (selectedRows.includes(row.id) ? idx : null))
            .filter((idx) => idx !== null),
          customToolbarSelect,
        }}
        onChange={onTableChange}
        emptyNode={<Empty>{t("noData")}</Empty>}
      />

      <Confirm
        title={t("delConfirmTitle")}
        open={!!(open && selectedRows.length)}
        confirmButton={{
          text: t("common.confirm"),
          props: { variant: "contained", color: "error", loading },
        }}
        cancelButton={{
          text: t("common.cancel"),
          props: { variant: "contained", color: "primary" },
        }}
        onConfirm={() => {
          onDelete(selectedRows);
          onClose();
        }}
        onCancel={onClose}
      >
        <Box sx={{ wordBreak: "break-word" }}>
          {t("delConfirmDescription", { id: selectedRows.join(",") })}
        </Box>
      </Confirm>
    </Box>
  );
};
export default Table;
