import { RuntimeOutputVariable } from "@aigne/agent-v1/types";
import {
  Avatar,
  Collapse,
  IconButton,
  type IconButtonProps,
  Stack,
  type StackProps,
} from "@mui/material";
import { memo, useMemo, useState } from "react";
import { parseIdentity, stringifyIdentity } from "../../aid";
import { getAssetUrl } from "../../api/asset";
import CustomComponentRenderer from "../../components/CustomComponentRenderer/CustomComponentRenderer";
import { useActiveAgent } from "../../contexts/ActiveAgent";
import { useAgent } from "../../contexts/Agent";
import { CurrentAgentProvider, useCurrentAgent } from "../../contexts/CurrentAgent";
import { useEntryAgent } from "../../contexts/EntryAgent";
import { useAppearances, useProfile } from "../../hooks/use-appearances";
import { isValidInput } from "../../utils/agent-inputs";
import { getOutputVariableInitialValue } from "../../utils/runtime-output-schema";
import DrawerOpenCloseIcon from "./DrawerOpenCloseIcon";

const COLLAPSED_SIZE = 80;

export interface InputsViewProps extends StackProps {
  collapsible?: boolean;
}

export default function InputsView({ collapsible, ...props }: InputsViewProps) {
  const { aid } = useActiveAgent();
  const agent = useAgent({ aid });

  const inputs = useMemo(() => agent.parameters?.filter(isValidInput), [agent]);
  const enableCollapse = collapsible && !!inputs && inputs.length > 1;
  const collapseSx = enableCollapse ? { maxHeight: "40vh", overflow: "auto" } : {};

  const [open, setOpen] = useState(true);

  return (
    <Stack gap={1} py={1} {...props}>
      {enableCollapse && (
        <Stack direction="row" justifyContent="center" onClick={() => setOpen(!open)} mb={-1}>
          <DrawerOpenCloseIcon color="grey.500" arrowDirection={open ? "down" : "up"} />
        </Stack>
      )}

      <AgentList sx={{ px: { xs: 2, sm: 3 } }} />

      <Collapse
        key={inputs?.length}
        in={!enableCollapse || open}
        orientation="vertical"
        collapsedSize={enableCollapse ? COLLAPSED_SIZE : 0}
        sx={{ py: 1, px: { xs: 2, sm: 3 }, ...collapseSx }}
      >
        <CurrentAgentProvider aid={aid}>
          <AgentInput />
        </CurrentAgentProvider>
      </Collapse>
    </Stack>
  );
}

const AgentList = memo(({ ...props }: StackProps) => {
  const { aid: activeAid, setActiveAid } = useActiveAgent();
  const { aid: entryAid } = useEntryAgent();
  const entryAgent = useAgent({ aid: entryAid });

  const children = useMemo(
    () =>
      getOutputVariableInitialValue(entryAgent, RuntimeOutputVariable.children)
        ?.agents?.filter((i) => !!i.id)
        .map((i) => ({
          ...i,
          aid: stringifyIdentity({
            ...parseIdentity(entryAid, { rejectWhenError: true }),
            agentId: i.id,
          }),
        })),
    [entryAid, entryAgent],
  );

  if (!children?.length || children.length <= 1) return null;

  return (
    <Stack direction="row" gap={2} py={1} overflow="auto" {...props}>
      {children?.map((child) => (
        <CurrentAgentProvider key={child.aid} aid={child.aid}>
          <AgentAvatar selected={activeAid === child.aid} onClick={() => setActiveAid(child.aid)} />
        </CurrentAgentProvider>
      ))}
    </Stack>
  );
});

function AgentAvatar({ selected, ...props }: { selected?: boolean } & IconButtonProps) {
  const { aid } = useEntryAgent();

  const { appearanceInput } = useAppearances();
  const profile = useProfile();

  if (!appearanceInput?.componentId) return null;

  return (
    <IconButton
      {...props}
      sx={{
        p: 0,
        outline: selected ? 3 : 0,
        outlineColor: "primary.light",
        ...props.sx,
      }}
    >
      <Avatar src={getAssetUrl({ aid, filename: profile?.avatar, preset: "avatar" })}>
        {profile.name?.slice(0, 1)}
      </Avatar>
    </IconButton>
  );
}

function AgentInput() {
  const { aid } = useCurrentAgent();
  const { appearanceInput } = useAppearances({ aid });

  if (!appearanceInput?.componentId) return null;

  return (
    <CustomComponentRenderer
      aid={aid}
      output={appearanceInput.outputSettings}
      componentId={appearanceInput.componentId}
      properties={appearanceInput.componentProperties}
    />
  );
}
