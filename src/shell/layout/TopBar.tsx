import { useAppState } from "../../app/providers/AppProviders";
import { useWorkspaceActions } from "../../app/hooks/useWorkspaceActions";
import { Button } from "../../components/primitives/Button";
import { DESTINATION_CONTEXT } from "../config/shell.constants";
import { NavigationDestination } from "../../state/appState.types";

type TopBarProps = {
  activeDestination: NavigationDestination;
  navMode: "expanded" | "rail" | "hidden";
  inspectorPresentation: "column" | "overlay" | "hidden";
  onOpenMobileNav: () => void;
};

const destinationLabels: Record<NavigationDestination, string> = {
  dashboard: "Dashboard",
  cards: "Cards",
  paymentPlan: "Payment Plan",
  calendar: "Calendar",
  settings: "Settings",
};

export function TopBar({
  activeDestination,
  navMode,
  inspectorPresentation,
  onOpenMobileNav,
}: TopBarProps) {
  const { state, dispatch } = useAppState();
  const { addCard, addPayment, editPlan } = useWorkspaceActions();
  const openAccounts = state.domain.accountOrder.filter((id) => !state.domain.accountsById[id]?.isClosed);
  const selectedAccountId = state.ui.selection.selectedAccountId;
  const inspectorToggleEligible =
    activeDestination === "cards" ||
    activeDestination === "dashboard" ||
    activeDestination === "calendar" ||
    activeDestination === "paymentPlan";
  const canToggleInspector = inspectorToggleEligible && Boolean(selectedAccountId);
  const handleToggleInspector = () => {
    dispatch({
      type: state.ui.inspector.isOpen ? "inspector/close" : "inspector/open",
    });
  };

  const renderPrimaryAction = () => {
    if (activeDestination === "dashboard") {
      return (
        <Button variant="primary" onClick={() => addCard()}>
          Add card
        </Button>
      );
    }

    if (activeDestination === "cards") {
      return selectedAccountId ? (
        <Button variant="primary" onClick={() => addPayment(selectedAccountId)}>
          Add payment
        </Button>
      ) : (
        <Button variant="primary" onClick={() => addCard()}>
          Add card
        </Button>
      );
    }

    if (activeDestination === "paymentPlan") {
      return (
        <Button variant="primary" onClick={() => editPlan()}>
          Edit plan
        </Button>
      );
    }

    if (activeDestination === "calendar") {
      return (
        <Button
          variant="primary"
          disabled={openAccounts.length === 0}
          onClick={() => addPayment(selectedAccountId)}
        >
          Add payment
        </Button>
      );
    }

    return null;
  };

  return (
    <header className="shell-topbar" aria-label="Top bar">
      <div className="shell-topbar__identity">
        {navMode === "hidden" ? (
          <button
            type="button"
            className="shell-topbar__menu-button"
            onClick={onOpenMobileNav}
            aria-label="Open navigation"
          >
            ☰
          </button>
        ) : null}
        <div>
          <div className="shell-topbar__eyebrow">Debt Command Center</div>
          <div className="shell-topbar__title-row">
            <h1 className="shell-topbar__title">{destinationLabels[activeDestination]}</h1>
            <span className="shell-topbar__context">{DESTINATION_CONTEXT[activeDestination]}</span>
          </div>
        </div>
      </div>

      <div className="shell-topbar__status" aria-live="polite">
        <div className="shell-topbar__status-copy">
          <span className="shell-topbar__status-pill">Editing flows</span>
          <span className="shell-topbar__status-text">
            {inspectorPresentation === "column"
              ? "Inspector docked"
              : inspectorPresentation === "overlay"
                ? "Inspector overlays on narrow width"
                : canToggleInspector
                  ? "Inspector available for the selected card"
                  : "Inspector hidden when not needed"}
          </span>
        </div>
        <div className="shell-topbar__actions">
          {canToggleInspector ? (
            <Button
              variant="ghost"
              onClick={handleToggleInspector}
              aria-pressed={state.ui.inspector.isOpen}
            >
              {state.ui.inspector.isOpen ? "Hide details" : "Show details"}
            </Button>
          ) : null}
          {renderPrimaryAction()}
        </div>
      </div>
    </header>
  );
}
