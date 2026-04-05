import { useWorkspaceActions } from "../../app/hooks/useWorkspaceActions";
import { Button } from "../../components/primitives/Button";
import { Panel } from "../../components/primitives/Panel";
import { Stack } from "../../components/primitives/Stack";

export function AccountQuickActions({ accountId }: { accountId: string }) {
  const { editCard, addPayment, closeAccount } = useWorkspaceActions();

  return (
    <Panel title="Quick actions" description="Controlled entry points keep editing explicit.">
      <Stack gap="sm">
        <Button variant="secondary" fullWidth onClick={() => editCard(accountId)}>
          Edit card
        </Button>
        <Button variant="secondary" fullWidth onClick={() => addPayment(accountId)}>
          Extra payment
        </Button>
        <Button variant="danger" fullWidth onClick={() => closeAccount(accountId)}>
          Mark account closed
        </Button>
      </Stack>
    </Panel>
  );
}
