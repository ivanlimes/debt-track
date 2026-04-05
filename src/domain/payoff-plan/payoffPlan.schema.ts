export const payoffPlanFieldSchema = {
  id: "string",
  strategy: "avalanche | snowball | custom",
  monthlyDebtBudget: "number | null",
  extraPaymentAmount: "number",
  customPriorityOrder: "string[]",
  useMinimumsFirst: "boolean",
  createdAt: "ISO datetime",
  updatedAt: "ISO datetime",
} as const;
