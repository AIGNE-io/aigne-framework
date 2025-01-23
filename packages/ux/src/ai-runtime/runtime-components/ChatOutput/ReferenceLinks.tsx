import { Link, Stack } from "@mui/material";

import type { RuntimeOutputVariablesSchema } from "@aigne/agent-v1";

export default function ReferenceLinks({
  links,
}: { links: RuntimeOutputVariablesSchema["$reference.links"] }) {
  return (
    <Stack sx={{ wordBreak: "break-word" }}>
      {links?.map((item) => (
        <ReferenceLinkItemView key={item.url} link={item} />
      ))}
    </Stack>
  );
}

function ReferenceLinkItemView({
  link,
}: {
  link: NonNullable<RuntimeOutputVariablesSchema["$reference.links"]>[number];
}) {
  return (
    <Stack>
      <Link href={link.url}>{link.title || link.url}</Link>
    </Stack>
  );
}
