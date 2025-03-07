import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import VerifiedIcon from "@iconify-icons/tabler/discount-check";
import { Icon } from "@iconify/react";
import { Box, Button, FormHelperText } from "@mui/material";
import axios from "axios";
import { useMemo, useRef } from "react";

import type { VerifyVCParameter } from "@aigne/agent-v1";
import { AI_RUNTIME_DID } from "../../constants";
import { useAgent } from "../../contexts/Agent";
import { useComponentPreferences } from "../../contexts/ComponentPreferences";
import { useCurrentAgent } from "../../contexts/CurrentAgent";
import { useEntryAgent } from "../../contexts/EntryAgent";
import { isValidInput } from "../../utils/agent-inputs";
import { getComponentMountPoint } from "../../utils/mount-point";
import { useSessionContext } from "../../utils/session";

export default function VerifyVC({
  parameter,
  value,
  onChange,
}: {
  parameter: VerifyVCParameter;
  value?: any;
  onChange?: (value?: any) => void;
}) {
  const preferences = useComponentPreferences();

  const { aid } = useCurrentAgent();
  const agent = useAgent({ aid });
  const parameters = useMemo(
    () =>
      agent.parameters
        ?.filter((i) => isValidInput(i) && !preferences?.hideInputFields?.includes(i.key))
        .map((i) => ({
          ...i,
          label: i.label?.trim() || undefined,
        })),
    [agent.parameters],
  );

  const isOnlyOneVCInput = parameters?.length === 1 && parameters[0]?.type === "verify_vc";

  const working = useEntryAgent({ optional: true })?.working;
  const { locale } = useLocaleContext();
  const { connectApi } = useSessionContext();

  const verified = value?.status === "succeed";

  const ref = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button
        ref={ref}
        fullWidth
        variant="outlined"
        onClick={() => {
          const api = axios.create({
            baseURL: getComponentMountPoint(AI_RUNTIME_DID),
          });

          connectApi.open({
            locale,
            action: "verify-vc",
            checkFn: api.get,
            extraParams: { aid, working, inputId: parameter.id },
            onSuccess: (res: any) => {
              onChange?.(res);
              if (isOnlyOneVCInput) {
                ref.current?.form?.requestSubmit();
              }
            },
            messages: {
              title: parameter.placeholder || parameter.helper || "Provide Your VC",
              scan: "Connect your DID Wallet to provide",
              confirm: "Confirm on your DID Wallet",
              success: "Ownership verified",
            },
          });
        }}
        endIcon={
          verified ? <Box component={Icon} icon={VerifiedIcon} color="success.main" /> : undefined
        }
      >
        {verified
          ? parameter.buttonTitleVerified || "Verify Succeed"
          : parameter.buttonTitle || "Verify VC"}
      </Button>

      {parameter.placeholder && <FormHelperText>{parameter.placeholder}</FormHelperText>}
    </>
  );
}
