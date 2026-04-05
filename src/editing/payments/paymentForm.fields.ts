import { PAYMENT_TYPES } from "../../domain/shared/enums";
import { FieldOption } from "../shared/form.types";

export const paymentTypeOptions: FieldOption[] = PAYMENT_TYPES.map((type) => ({
  value: type,
  label:
    type === "autopay"
      ? "Autopay"
      : type === "extra"
        ? "Extra payment"
        : type === "statement"
          ? "Statement payment"
          : "Manual payment",
}));
