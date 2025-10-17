import Box from "@mui/material/Box";

export interface SearchState {
  componentId: string;
  searchText: string;
  dateRange: [Date, Date];
  showImportedOnly?: boolean;
}

export const BlockletComponent = ({
  component,
}: {
  component: (typeof window.blocklet.componentMountPoints)[number];
}) => {
  const url = new URL(window.location.origin);
  url.pathname = `/.well-known/service/blocklet/logo-bundle/${component.did}`;
  url.searchParams.set("v", "0.5.55");

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 1 }} component="img" src={url.toString()} />
      <Box>{component?.title ?? component?.name}</Box>
    </Box>
  );
};
