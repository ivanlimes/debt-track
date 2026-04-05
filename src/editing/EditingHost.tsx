import { useMemo } from "react";
import { useAppState } from "../app/providers/AppProviders";
import { Button } from "../components/primitives/Button";
import { Stack } from "../components/primitives/Stack";
import { EditSurface } from "./shared/EditSurface";
import { AddCardFlow } from "./cards/AddCardFlow";
import { EditCardFlow } from "./cards/EditCardFlow";
import { AddPaymentFlow } from "./payments/AddPaymentFlow";
import { EditPaymentFlow } from "./payments/EditPaymentFlow";
import { EditPayoffPlanFlow } from "./payoff-plan/EditPayoffPlanFlow";

export function EditingHost() {
  const { state, dispatch } = useAppState();
  const activeFlow = state.ui.editing.activeFlow;
  const targetId = state.ui.editing.targetId;

  const closeFlow = () => {
    dispatch({ type: "editing/stop" });
  };

  const closeAccountName = useMemo(() => {
    if (!targetId) return "this account";
    const account = state.domain.accountsById[targetId];
    return account?.name || "this account";
  }, [state.domain.accountsById, targetId]);

  return (
    <>
      <AddCardFlow open={activeFlow === "addCard"} onClose={closeFlow} />
      <EditCardFlow open={activeFlow === "editCard"} accountId={targetId} onClose={closeFlow} />
      <AddPaymentFlow open={activeFlow === "addPayment"} defaultCardId={targetId ?? state.ui.selection.selectedAccountId} onClose={closeFlow} />
      <EditPaymentFlow open={activeFlow === "editPayment"} paymentId={targetId} onClose={closeFlow} />
      <EditPayoffPlanFlow open={activeFlow === "editPlan"} onClose={closeFlow} />
      <EditSurface
        open={activeFlow === "closeAccount"}
        title="Close account"
        description="Closing a card preserves history but removes it from default open-account views."
        onClose={closeFlow}
        footer={
          <Stack direction="horizontal" justify="space-between" gap="sm">
            <Button variant="ghost" onClick={closeFlow}>Cancel</Button>
            <Button
              variant="danger"
              disabled={!targetId}
              onClick={() => {
                if (!targetId) return;
                dispatch({ type: "accounts/close", payload: { accountId: targetId } });
                dispatch({ type: "selection/selectAccount", payload: targetId });
                dispatch({ type: "inspector/open" });
                dispatch({ type: "editing/stop" });
              }}
            >
              Mark closed
            </Button>
          </Stack>
        }
      >
        <p>
          {closeAccountName} will remain in the dataset for history, but it will stop appearing in default open-account views.
        </p>
      </EditSurface>
    </>
  );
}
