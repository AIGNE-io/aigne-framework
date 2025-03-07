import { Link, Stack } from "@mui/material";

import OutputFieldContainer from "../../components/OutputFieldContainer";
import { useCurrentMessageOutput } from "../../contexts/CurrentMessage";

export type ReferencedLinksViewPropValue = Array<{
  title: string;
  url: string;
}>;

export default function ReferencedLinksView() {
  const { outputValue, output } = useCurrentMessageOutput<ReferencedLinksViewPropValue>();

  if (!outputValue.length) return null;

  return (
    <OutputFieldContainer output={output}>
      <Stack gap={1}>
        {outputValue.map((item, index) => (
          <Link key={index} href={item.url}>
            {item.title}
          </Link>
        ))}
      </Stack>
    </OutputFieldContainer>
  );
}
