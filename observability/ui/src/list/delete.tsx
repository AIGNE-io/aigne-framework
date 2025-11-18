import { Confirm } from "@arcblock/ux/lib/Dialog";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { useState } from "react";
import { joinURL } from "ufo";
import { useTraceContext } from "../contexts/trace-context.tsx";
import { origin } from "../utils/index.ts";

const Delete = ({
  dialogOpen,
  setDialogOpen,
}: {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}) => {
  const { t } = useLocaleContext();
  const { fetchTraces, page } = useTraceContext();
  const [loading, setLoading] = useState(false);

  const deleteTraces = async () => {
    try {
      setLoading(true);
      await fetch(joinURL(origin, "/api/trace/tree"), { method: "DELETE" });
      await fetchTraces({ page: 1, pageSize: page.pageSize || 20 });
    } finally {
      setLoading(false);
      setDialogOpen(false);
    }
  };

  return (
    <Confirm
      confirmButton={{
        text: loading ? t("deleting") : t("common.confirm"),
        props: {
          variant: "contained",
          color: "error",
          disabled: loading,
        },
      }}
      cancelButton={{
        text: t("common.cancel"),
        props: {
          color: "primary",
          disabled: loading,
        },
      }}
      open={dialogOpen}
      title={t("delete.restConfirmTitle")}
      onConfirm={deleteTraces}
      onCancel={() => setDialogOpen(false)}
    >
      <p>{loading ? t("delete.deleting") : t("delete.restConfirmDesc")}</p>
    </Confirm>
  );
};
export default Delete;
