import { CustomComponentRenderer } from "@blocklet/pages-kit/components";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";

import AgentSettingsDialog from "../../components/AgentSettings/AgentSettingsDialog";
import ScrollView from "../../components/ScrollView";
import { useAgent } from "../../contexts/Agent";
import { useEntryAgent } from "../../contexts/EntryAgent";
import { RuntimeProvider } from "../../contexts/Runtime";
import { CustomError } from "../../error";
import { useAppearances } from "../../hooks/use-appearances";
import { useHeaderMenu } from "../../hooks/use-header-menu";

export default function Runtime(props: {
  aid?: string;
  working?: boolean;
  debug?: boolean;
  children?: React.ReactNode;
}) {
  const [query] = useSearchParams();

  const aid = props.aid || query.get("aid");
  if (!aid) throw new CustomError(404, "Missing required query parameters `aid`");

  return (
    <RuntimeProvider aid={aid} working={props.working} debug={props.debug}>
      <RuntimeView />
      {props.children}
    </RuntimeProvider>
  );
}

function RuntimeView() {
  const { aid } = useEntryAgent();
  const agent = useAgent({ aid });
  const { appearancePage } = useAppearances({ aid });

  return (
    <>
      <HeaderMenu />

      <Helmet>
        {agent.project.name && <title>{agent.project.name}</title>}
        {agent.project.description && (
          <meta name="description" content={agent.project.description} />
        )}
      </Helmet>

      <ScrollView scroll="window" initialScrollBehavior="auto">
        <CustomComponentRenderer
          componentId={appearancePage.componentId}
          properties={appearancePage.componentProperties}
        />
      </ScrollView>

      <AgentSettingsDialog />
    </>
  );
}

function HeaderMenu() {
  useHeaderMenu();

  return null;
}
