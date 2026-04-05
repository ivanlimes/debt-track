import { FilterKey, SortKey } from "../../domain/shared/enums";

export const cardsSortOptions: { value: SortKey; label: string }[] = [
  { value: "highest_monthly_interest", label: "Highest monthly interest" },
  { value: "lowest_balance", label: "Lowest balance" },
  { value: "highest_balance", label: "Highest balance" },
  { value: "highest_apr", label: "Highest APR" },
  { value: "lowest_apr", label: "Lowest APR" },
  { value: "soonest_due_date", label: "Soonest due date" },
  { value: "soonest_payoff", label: "Soonest payoff" },
  { value: "promo_ending_soon", label: "Promo ending soon" },
  { value: "highest_utilization", label: "Highest utilization" },
  { value: "lowest_utilization", label: "Lowest utilization" },
  { value: "issuer_az", label: "Issuer A–Z" },
  { value: "card_name_az", label: "Card name A–Z" },
];

export const cardsFilterOptions: { value: FilterKey; label: string }[] = [
  { value: "all_open", label: "All open cards" },
  { value: "due_soon", label: "Due soon" },
  { value: "overdue", label: "Overdue" },
  { value: "high_utilization", label: "High utilization" },
  { value: "promo_active", label: "Promo active" },
  { value: "promo_ending_soon", label: "Promo ending soon" },
  { value: "closest_to_payoff", label: "Closest to payoff" },
  { value: "largest_balance", label: "Largest balance" },
  { value: "highest_interest_cost", label: "Highest interest cost" },
  { value: "closed_accounts", label: "Closed accounts" },
];
