import { DashboardScreen } from "./dashboard/DashboardScreen";
import { CardsScreen } from "./cards/CardsScreen";
import { PaymentPlanScreen } from "./payment-plan/PaymentPlanScreen";
import { CalendarScreen } from "./calendar/CalendarScreen";
import { SettingsScreen } from "./settings/SettingsScreen";

export const screenRegistry = {
  dashboard: DashboardScreen,
  cards: CardsScreen,
  paymentPlan: PaymentPlanScreen,
  calendar: CalendarScreen,
  settings: SettingsScreen,
} as const;
