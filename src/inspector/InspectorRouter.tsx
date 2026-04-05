import { useAppState } from "../app/providers/AppProviders";
import { AccountInspector } from "./account/AccountInspector";
import { InspectorEmptyState } from "./InspectorEmptyState";

export function InspectorRouter() {
  const { state } = useAppState();

  if (!state.ui.inspector.isOpen || !state.ui.selection.selectedAccountId) {
    return <InspectorEmptyState />;
  }

  return <AccountInspector accountId={state.ui.selection.selectedAccountId} />;
}
