export const BALANCE_BUCKET_TYPES = [
  "purchase",
  "cash_advance",
  "balance_transfer",
  "promo_purchase",
  "deferred_interest",
  "other",
] as const;

export type BalanceBucketType = (typeof BALANCE_BUCKET_TYPES)[number];

export type BalanceBucket = {
  id: string;
  label: string;
  bucketType: BalanceBucketType;
  currentBalance: number;
  apr: number;
  hasPromoApr: boolean;
  promoApr: number | null;
  promoEndDate: string | null;
  aprAfterPromo: number | null;
  isDeferredInterest: boolean;
  notes: string | null;
};

export type CreditCardAccount = {
  id: string;
  name: string;
  issuer: string;
  currentBalance: number;
  creditLimit: number;
  standardApr: number;
  minimumPayment: number;
  dueDayOfMonth: number;
  statementDayOfMonth: number | null;
  lastPaymentDate: string | null;
  lastKnownStatementDate: string | null;
  hasPromoApr: boolean;
  promoApr: number | null;
  promoEndDate: string | null;
  aprAfterPromo: number | null;
  isDeferredInterest: boolean;
  deferredInterestAprBasis: number | null;
  deferredInterestStartDate: string | null;
  hasSplitBalances: boolean;
  balanceBuckets: BalanceBucket[] | null;
  annualFee: number | null;
  notes: string | null;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCreditCardAccountInput = Omit<
  CreditCardAccount,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateCreditCardAccountInput = Partial<
  Omit<CreditCardAccount, "id" | "createdAt" | "updatedAt">
>;
