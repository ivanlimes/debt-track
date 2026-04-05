import { CreditCardAccount } from "../../domain/accounts/account.types";
import { roundCurrency, toIsoDate, toStartOfDay, diffInCalendarDays } from "../shared/calculation.helpers";
import { DeferredInterestDetails, DeferredInterestRiskStatus } from "../shared/calculation.types";
import { getPromoDaysRemaining } from "../timing/getPromoDaysRemaining";

const AVERAGE_DAYS_PER_MONTH = 30.4375;


function estimateSimpleInterest(balance: number, apr: number, days: number) {
  if (balance <= 0 || apr <= 0 || days <= 0) {
    return 0;
  }

  return roundCurrency(balance * (apr / 100) * (days / 365));
}

function resolveRiskStatus(params: {
  isDeferredInterestContract: boolean;
  currentBalance: number;
  daysRemaining: number | null;
  safeByDeadline: boolean | null;
}): DeferredInterestRiskStatus {
  if (!params.isDeferredInterestContract) {
    return "none";
  }

  if (params.currentBalance <= 0) {
    return "safe";
  }

  if (params.daysRemaining !== null && params.daysRemaining < 0) {
    return "expired";
  }

  if (params.safeByDeadline) {
    return "safe";
  }

  if (params.daysRemaining !== null && params.daysRemaining <= 14) {
    return "critical";
  }

  if (params.daysRemaining !== null && params.daysRemaining <= 45) {
    return "warning";
  }

  return "watch";
}

function buildWarningMessage(params: {
  status: DeferredInterestRiskStatus;
  promoEndDate: string | null;
  payoffByPromoDeadlineMonthlyTarget: number | null;
  penaltyExposure: number | null;
}) {
  if (!params.promoEndDate || params.status === "none") {
    return null;
  }

  const formattedDate = toIsoDate(params.promoEndDate);

  if (params.status === "safe") {
    return `On track to clear this deferred-interest balance by ${formattedDate} and avoid retroactive interest.`;
  }

  if (params.status === "expired") {
    return `Promo deadline passed on ${formattedDate}. Deferred-interest penalty exposure may have been triggered if the balance was not cleared in full.`;
  }

  if (
    params.status === "watch" ||
    params.status === "warning" ||
    params.status === "critical"
  ) {
    return `Clear this balance by ${formattedDate} to avoid deferred-interest penalty exposure.`;
  }

  return null;
}

function buildPromoRiskBadges(status: DeferredInterestRiskStatus) {
  switch (status) {
    case "safe":
      return ["Deferred interest", "On track"];
    case "watch":
      return ["Deferred interest", "Deadline watch"];
    case "warning":
      return ["Deferred interest", "Avoid by deadline"];
    case "critical":
      return ["Deferred interest", "Immediate promo risk"];
    case "expired":
      return ["Deferred interest", "Penalty risk triggered"];
    default:
      return [];
  }
}

export function getDeferredInterestDetails(
  account: Pick<
    CreditCardAccount,
    | "hasPromoApr"
    | "promoEndDate"
    | "currentBalance"
    | "isDeferredInterest"
    | "deferredInterestAprBasis"
    | "deferredInterestStartDate"
    | "aprAfterPromo"
    | "standardApr"
  >,
  projectedPayoffDate: string | null,
  asOfDate?: Date | string,
): DeferredInterestDetails {
  const isDeferredInterestContract =
    account.hasPromoApr && account.isDeferredInterest && Boolean(account.promoEndDate);

  if (!isDeferredInterestContract) {
    return {
      isDeferredInterestActive: false,
      deferredInterestDaysRemaining: null,
      deferredInterestShadowAccrued: null,
      deferredInterestPenaltyExposure: null,
      payoffByPromoDeadlineMonthlyTarget: null,
      deferredInterestRiskStatus: "none",
      deferredInterestSafeByDeadline: null,
      deferredInterestWarningMessage: null,
      promoRiskBadges: [],
      deferredInterestAprBasis: null,
    };
  }

  const basisApr =
    account.deferredInterestAprBasis ?? account.aprAfterPromo ?? account.standardApr;
  const daysRemaining = getPromoDaysRemaining(account, asOfDate);
  const currentBalance = Math.max(account.currentBalance, 0);
  const startDate = account.deferredInterestStartDate
    ? toStartOfDay(account.deferredInterestStartDate)
    : null;
  const today = toStartOfDay(asOfDate);
  const promoEndDate = account.promoEndDate ?? null;

  const elapsedDays = startDate ? Math.max(diffInCalendarDays(today, startDate), 0) : 0;
  const totalPromoDays =
    startDate && promoEndDate ? Math.max(diffInCalendarDays(promoEndDate, startDate), 0) : 0;

  const shadowAccrued =
    startDate && basisApr > 0 ? estimateSimpleInterest(currentBalance, basisApr, elapsedDays) : 0;
  const penaltyExposure =
    startDate && basisApr > 0 ? estimateSimpleInterest(currentBalance, basisApr, totalPromoDays) : 0;

  const safeByDeadline =
    currentBalance <= 0 || (projectedPayoffDate !== null && promoEndDate !== null && projectedPayoffDate <= promoEndDate);

  const payoffByPromoDeadlineMonthlyTarget =
    daysRemaining !== null && daysRemaining > 0 && currentBalance > 0
      ? roundCurrency(currentBalance / (Math.max(daysRemaining, 1) / AVERAGE_DAYS_PER_MONTH))
      : null;

  const deferredInterestRiskStatus = resolveRiskStatus({
    isDeferredInterestContract,
    currentBalance,
    daysRemaining,
    safeByDeadline,
  });

  return {
    isDeferredInterestActive: daysRemaining !== null ? daysRemaining >= 0 : true,
    deferredInterestDaysRemaining: daysRemaining,
    deferredInterestShadowAccrued: shadowAccrued,
    deferredInterestPenaltyExposure: penaltyExposure,
    payoffByPromoDeadlineMonthlyTarget,
    deferredInterestRiskStatus,
    deferredInterestSafeByDeadline: safeByDeadline,
    deferredInterestWarningMessage: buildWarningMessage({
      status: deferredInterestRiskStatus,
      promoEndDate,
      payoffByPromoDeadlineMonthlyTarget,
      penaltyExposure,
    }),
    promoRiskBadges: buildPromoRiskBadges(deferredInterestRiskStatus),
    deferredInterestAprBasis: basisApr,
  };
}
