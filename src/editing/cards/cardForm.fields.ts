import { BALANCE_BUCKET_TYPES } from "../../domain/accounts/account.types";
import { FieldOption } from "../shared/form.types";

export const dayOfMonthOptions: FieldOption[] = Array.from({ length: 31 }, (_, index) => {
  const day = index + 1;
  return {
    value: String(day),
    label: String(day),
  };
});

export const booleanOptions: FieldOption[] = [
  { value: "false", label: "No" },
  { value: "true", label: "Yes" },
];

export const balanceBucketTypeOptions: FieldOption[] = BALANCE_BUCKET_TYPES.map((value) => ({
  value,
  label: value.replace(/_/g, " "),
}));
