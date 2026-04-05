export const paymentRecordFieldSchema = {
  id: "string",
  cardId: "string",
  amount: "number",
  paymentDate: "ISO date",
  paymentType: "manual | autopay | extra | statement",
  notes: "string | null",
  createdAt: "ISO datetime",
  updatedAt: "ISO datetime",
} as const;
