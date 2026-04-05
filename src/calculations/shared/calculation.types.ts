import { CreditCardAccount } from "../../domain/accounts/account.types";

export type PromoStatus = "none" | "active" | "ending_soon" | "expired";
export type RiskItemType = "due_soon" | "promo_ending_soon" | "promo_expired" | "deferred_interest_warning" | "deferred_interest_expired";
export type RiskItemSeverity = "info" | "warning" | "critical";

export type RiskItem = {
  type: RiskItemType;
  severity: RiskItemSeverity;
  accountId: string;
  accountName: string;
  date: string;
  daysRemaining: number;
  label: string;
};

export type RankedAccount = {
  accountId: string;
  accountName: string;
  rank: number;
  currentBalance: number;
  activeApr: number;
  estimatedMonthlyInterest: number;
  projectedPayoffDate: string | null;
  projectedMonthsRemaining: number | null;
  reason: string;
};

export type ProjectedAccountBalance = {
  accountId: string;
  accountName: string;
  balance: number;
};

export type ProjectionSeriesAccountPoint = {
  accountId: string;
  accountName: string;
  openingBalance: number;
  minimumPaymentApplied: number;
  extraPaymentApplied: number;
  totalPaymentApplied: number;
  interestCharged: number;
  principalPaid: number;
  endingBalance: number;
  isTargetCard: boolean;
};

export type ProjectionSeriesPoint = {
  monthIndex: number;
  periodLabel: string;
  monthStartDate: string;
  monthEndDate: string;
  totalBalanceStart: number;
  openingBalance: number;
  minimumPaymentTotal: number;
  extraPaymentTotal: number;
  totalInterestAdded: number;
  interestCharged: number;
  totalPaymentApplied: number;
  totalPayment: number;
  principalPaid: number;
  totalBalanceEnd: number;
  endingBalance: number;
  cumulativeInterestPaid: number;
  cumulativePrincipalPaid: number;
  remainingMonthsAfter: number | null;
  principalExceedsInterest: boolean;
  isTippingPoint: boolean;
  targetCardId: string | null;
  planStrategy: "avalanche" | "snowball" | "custom";
  remainingAccountBalances: ProjectedAccountBalance[];
  accountBreakdown: ProjectionSeriesAccountPoint[];
};

export type ProjectionTippingPoint = {
  monthIndex: number;
  monthStartDate: string;
  monthEndDate: string;
  periodLabel: string;
};

export type ProjectionSeriesResult = {
  debtFreeDate: string | null;
  projectedMonthsRemaining: number | null;
  projectedInterestRemaining: number;
  tippingPoint: ProjectionTippingPoint | null;
  series: ProjectionSeriesPoint[];
  monthByMonthProjectionSeries: ProjectionSeriesPoint[];
};


export type DeferredInterestRiskStatus =
  | "none"
  | "safe"
  | "watch"
  | "warning"
  | "critical"
  | "expired";

export type DeferredInterestDetails = {
  isDeferredInterestActive: boolean;
  deferredInterestDaysRemaining: number | null;
  deferredInterestShadowAccrued: number | null;
  deferredInterestPenaltyExposure: number | null;
  payoffByPromoDeadlineMonthlyTarget: number | null;
  deferredInterestRiskStatus: DeferredInterestRiskStatus;
  deferredInterestSafeByDeadline: boolean | null;
  deferredInterestWarningMessage: string | null;
  promoRiskBadges: string[];
  deferredInterestAprBasis: number | null;
};

export type HighestInterestCardSummary = {
  account: CreditCardAccount;
  estimatedMonthlyInterest: number;
};

export type NextPromoExpirationSummary = {
  account: CreditCardAccount;
  promoEndDate: string;
  daysRemaining: number;
};

export type DashboardSummary = {
  totalDebt: number;
  totalAvailableCredit: number;
  overallUtilizationPercent: number | null;
  totalMinimumDueThisMonth: number;
  totalPaidThisMonth: number;
  totalEstimatedMonthlyInterest: number;
  projectedDebtFreeDate: string | null;
  projectedMonthsRemaining: number | null;
  highestInterestCard: HighestInterestCardSummary | null;
  nextPromoExpiration: NextPromoExpirationSummary | null;
  upcomingRiskItems: RiskItem[];
};
