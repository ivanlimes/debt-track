import { createAppPreferences } from "../domain/preferences/preferences.defaults";
import { createPayoffPlan } from "../domain/payoff-plan/payoffPlan.defaults";
import {
  CreateCreditCardAccountInput,
  UpdateCreditCardAccountInput,
} from "../domain/accounts/account.types";
import {
  CreatePaymentRecordInput,
  UpdatePaymentRecordInput,
} from "../domain/payments/payment.types";
import { UpdatePayoffPlanInput } from "../domain/payoff-plan/payoffPlan.types";
import { UpdateAppPreferencesInput } from "../domain/preferences/preferences.types";
import { AppState, DomainState, NavigationDestination } from "./appState.types";
import {
  createAccountInState,
  markAccountClosedInState,
  updateAccountInState,
} from "./domain/accounts.store";
import {
  createPaymentInState,
  deletePaymentInState,
  updatePaymentInState,
} from "./domain/payments.store";
import { updatePayoffPlanInState } from "./domain/payoffPlan.store";
import { updatePreferencesInState } from "./domain/preferences.store";
import { closeInspector, openInspector, setInspectorMode } from "./ui/inspector.store";
import { setActiveDestination } from "./ui/navigation.store";
import { selectAccount, selectPayment } from "./ui/selection.store";
import { startEditing, stopEditing } from "./ui/editing.store";
import { synchronizeUiWithDomain } from "./ui/synchronize.store";

export type AppAction =
  | { type: "domain/replace"; payload: DomainState }
  | { type: "navigation/setDestination"; payload: NavigationDestination }
  | { type: "inspector/open" }
  | { type: "inspector/close" }
  | { type: "inspector/setMode"; payload: AppState["ui"]["inspector"]["mode"] }
  | { type: "selection/selectAccount"; payload: string | null }
  | { type: "selection/selectPayment"; payload: string | null }
  | {
      type: "editing/start";
      payload: {
        flow: NonNullable<AppState["ui"]["editing"]["activeFlow"]>;
        targetId?: string | null;
      };
    }
  | { type: "editing/stop" }
  | { type: "accounts/create"; payload: CreateCreditCardAccountInput }
  | {
      type: "accounts/update";
      payload: { accountId: string; patch: UpdateCreditCardAccountInput };
    }
  | { type: "accounts/close"; payload: { accountId: string } }
  | { type: "payments/create"; payload: CreatePaymentRecordInput }
  | {
      type: "payments/update";
      payload: { paymentId: string; patch: UpdatePaymentRecordInput };
    }
  | { type: "payments/delete"; payload: { paymentId: string } }
  | { type: "payoffPlan/update"; payload: UpdatePayoffPlanInput }
  | { type: "preferences/update"; payload: UpdateAppPreferencesInput };

export function createInitialAppState(): AppState {
  return {
    domain: {
      accountsById: {},
      accountOrder: [],
      paymentsById: {},
      paymentOrder: [],
      activePayoffPlan: createPayoffPlan(),
      preferences: createAppPreferences(),
    },
    ui: {
      navigation: {
        activeDestination: "dashboard",
      },
      selection: {
        selectedAccountId: null,
        selectedPaymentId: null,
      },
      inspector: {
        isOpen: false,
        mode: "summary",
      },
      editing: {
        activeFlow: null,
        targetId: null,
      },
    },
  };
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "domain/replace": {
      const nextDomain = action.payload;
      return {
        ...state,
        domain: nextDomain,
        ui: synchronizeUiWithDomain(state.ui, nextDomain),
      };
    }

    case "navigation/setDestination":
      return {
        ...state,
        ui: synchronizeUiWithDomain(setActiveDestination(state.ui, action.payload), state.domain),
      };

    case "inspector/open":
      return {
        ...state,
        ui: openInspector(state.ui),
      };

    case "inspector/close":
      return {
        ...state,
        ui: closeInspector(state.ui),
      };

    case "inspector/setMode":
      return {
        ...state,
        ui: setInspectorMode(state.ui, action.payload),
      };

    case "selection/selectAccount":
      return {
        ...state,
        ui: synchronizeUiWithDomain(selectAccount(state.ui, action.payload), state.domain),
      };

    case "selection/selectPayment":
      return {
        ...state,
        ui: synchronizeUiWithDomain(selectPayment(state.ui, action.payload), state.domain),
      };

    case "editing/start":
      return {
        ...state,
        ui: startEditing(state.ui, action.payload.flow, action.payload.targetId ?? null),
      };

    case "editing/stop":
      return {
        ...state,
        ui: stopEditing(state.ui),
      };

    case "accounts/create": {
      const nextDomain = createAccountInState(state.domain, action.payload);
      const createdAccountId = nextDomain.accountOrder.find((id) => !state.domain.accountsById[id]) ?? null;
      const nextUi = createdAccountId
        ? openInspector(selectAccount(state.ui, createdAccountId))
        : state.ui;

      return {
        ...state,
        domain: nextDomain,
        ui: synchronizeUiWithDomain(nextUi, nextDomain),
      };
    }

    case "accounts/update": {
      const nextDomain = updateAccountInState(
        state.domain,
        action.payload.accountId,
        action.payload.patch,
      );
      const nextUi = openInspector(selectAccount(state.ui, action.payload.accountId));

      return {
        ...state,
        domain: nextDomain,
        ui: synchronizeUiWithDomain(nextUi, nextDomain),
      };
    }

    case "accounts/close": {
      const nextDomain = markAccountClosedInState(state.domain, action.payload.accountId);
      const nextUi = openInspector(selectAccount(state.ui, action.payload.accountId));

      return {
        ...state,
        domain: nextDomain,
        ui: synchronizeUiWithDomain(nextUi, nextDomain),
      };
    }

    case "payments/create": {
      const nextDomain = createPaymentInState(state.domain, action.payload);
      const createdPaymentId = nextDomain.paymentOrder.find((id) => !state.domain.paymentsById[id]) ?? null;
      let nextUi = openInspector(selectAccount(state.ui, action.payload.cardId));
      if (createdPaymentId) {
        nextUi = selectPayment(nextUi, createdPaymentId);
      }

      return {
        ...state,
        domain: nextDomain,
        ui: synchronizeUiWithDomain(nextUi, nextDomain),
      };
    }

    case "payments/update": {
      const nextDomain = updatePaymentInState(
        state.domain,
        action.payload.paymentId,
        action.payload.patch,
      );
      const updatedPayment = nextDomain.paymentsById[action.payload.paymentId];
      let nextUi = state.ui;
      if (updatedPayment) {
        nextUi = openInspector(selectAccount(state.ui, updatedPayment.cardId));
        nextUi = selectPayment(nextUi, updatedPayment.id);
      }

      return {
        ...state,
        domain: nextDomain,
        ui: synchronizeUiWithDomain(nextUi, nextDomain),
      };
    }

    case "payments/delete": {
      const existingPayment = state.domain.paymentsById[action.payload.paymentId] ?? null;
      const nextDomain = deletePaymentInState(state.domain, action.payload.paymentId);
      let nextUi = selectPayment(state.ui, null);
      if (existingPayment) {
        nextUi = openInspector(selectAccount(nextUi, existingPayment.cardId));
      }

      return {
        ...state,
        domain: nextDomain,
        ui: synchronizeUiWithDomain(nextUi, nextDomain),
      };
    }

    case "payoffPlan/update": {
      const nextDomain = updatePayoffPlanInState(state.domain, action.payload);
      return {
        ...state,
        domain: nextDomain,
        ui: synchronizeUiWithDomain(state.ui, nextDomain),
      };
    }

    case "preferences/update": {
      const nextDomain = updatePreferencesInState(state.domain, action.payload);
      return {
        ...state,
        domain: nextDomain,
        ui: synchronizeUiWithDomain(state.ui, nextDomain),
      };
    }

    default:
      return state;
  }
}
