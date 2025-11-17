import { Confirm } from "@arcblock/ux/lib/Dialog";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { joinURL } from "ufo";
import { origin } from "../utils/index.ts";

const Delete = ({
  dialogOpen,
  setDialogOpen,
  fetchTraces,
  setLoading,
}: {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  fetchTraces: () => void;
  setLoading: (loading: boolean) => void;
}) => {
  const { t } = useLocaleContext();

  const deleteTraces = async () => {
    try {
      setLoading(true);
      await fetch(joinURL(origin, "/api/trace/tree"), { method: "DELETE" });
      fetchTraces();
    } finally {
      setDialogOpen(false);
      setLoading(false);
    }
  };

  return (
    <Confirm
      confirmButton={{
        text: t("common.confirm"),
        props: {
          variant: "contained",
          color: "error",
        },
      }}
      cancelButton={{
        text: t("common.cancel"),
        props: {
          color: "primary",
        },
      }}
      open={dialogOpen}
      title={t("delete.restConfirmTitle")}
      onConfirm={deleteTraces}
      onCancel={() => setDialogOpen(false)}
    >
      <p>{t("delete.restConfirmDesc")}</p>
    </Confirm>
  );
};
export default Delete;
