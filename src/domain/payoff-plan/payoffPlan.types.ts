import { PayoffStrategy } from "../shared/enums";

export type PayoffPlan = {
  id: string;
  strategy: PayoffStrategy;
  monthlyDebtBudget: number | null;
  extraPaymentAmount: number;
  customPriorityOrder: string[];
  useMinimumsFirst: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatePayoffPlanInput = Omit<PayoffPlan, "id" | "createdAt" | "updatedAt">;
export type UpdatePayoffPlanInput = Partial<
  Omit<PayoffPlan, "id" | "createdAt" | "updatedAt">
>;
