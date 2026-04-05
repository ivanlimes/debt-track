import { CreditCardAccount } from "../domain/accounts/account.types";
import { PaymentRecord } from "../domain/payments/payment.types";
import { PayoffPlan } from "../domain/payoff-plan/payoffPlan.types";
import { AppPreferences } from "../domain/preferences/preferences.types";

export type DomainState = {
  accountsById: Record<string, CreditCardAccount>;
  accountOrder: string[];
  paymentsById: Record<string, PaymentRecord>;
  paymentOrder: string[];
  activePayoffPlan: PayoffPlan;
  preferences: AppPreferences;
};

export type NavigationDestination =
  | "dashboard"
  | "cards"
  | "paymentPlan"
  | "calendar"
  | "settings";

export type NavigationState = {
  activeDestination: NavigationDestination;
};

export type SelectionState = {
  selectedAccountId: string | null;
  selectedPaymentId: string | null;
};

export type InspectorState = {
  isOpen: boolean;
  mode: "summary" | "details" | "history";
};

export type EditingState = {
  activeFlow:
    | null
    | "addCard"
    | "editCard"
    | "addPayment"
    | "editPayment"
    | "editPlan"
    | "closeAccount";
  targetId: string | null;
};

export type UiState = {
  navigation: NavigationState;
  selection: SelectionState;
  inspector: InspectorState;
  editing: EditingState;
};

export type AppState = {
  domain: DomainState;
  ui: UiState;
};
