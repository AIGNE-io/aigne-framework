import { cx } from "@emotion/css";
import { Stack, type StackProps, Typography, type TypographyProps } from "@mui/material";
import Balancer, { Provider } from "react-wrap-balancer";

import { useEntryAgent } from "../../contexts/EntryAgent";
import { useProfile } from "../../hooks/use-appearances";

export default function SimpleHeader({
  TitleProps,
  DescriptionProps,
  ...props
}: {
  TitleProps?: TypographyProps;
  DescriptionProps?: TypographyProps;
} & StackProps) {
  const { aid } = useEntryAgent();
  const profile = useProfile({ aid });

  const { name, description } = profile;

  return (
    <Stack
      gap={2}
      mt={8}
      mb={4}
      {...props}
      className={cx("aigne-header aigne-simple-header", props.className)}
    >
      <Provider>
        {name && (
          <Typography
            width="100%"
            variant="h4"
            fontSize={30}
            fontWeight={700}
            textAlign="center"
            {...TitleProps}
          >
            <Balancer>{name}</Balancer>
          </Typography>
        )}
        {description && (
          <Typography width="100%" textAlign="center" {...DescriptionProps}>
            <Balancer>{description}</Balancer>
          </Typography>
        )}
      </Provider>
    </Stack>
  );
}
