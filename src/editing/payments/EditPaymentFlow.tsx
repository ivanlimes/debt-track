import { useEffect, useMemo, useState } from "react";
import { useAppState } from "../../app/providers/AppProviders";
import { Button } from "../../components/primitives/Button";
import { Input } from "../../components/primitives/Input";
import { Select } from "../../components/primitives/Select";
import { Stack } from "../../components/primitives/Stack";
import { EditSurface } from "../shared/EditSurface";
import { paymentTypeOptions } from "./paymentForm.fields";
import { PaymentFormState, createPaymentFormState, mapPaymentFormToInput, validatePaymentForm } from "./paymentForm.mapping";

export function EditPaymentFlow({ open, paymentId, onClose }: { open: boolean; paymentId: string | null; onClose: () => void }) {
  const { state, dispatch } = useAppState();
  const payment = paymentId ? state.domain.paymentsById[paymentId] ?? null : null;
  const [form, setForm] = useState<PaymentFormState>(() => createPaymentFormState(payment));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(createPaymentFormState(payment));
    setErrors({});
  }, [payment]);

  const cardOptions = useMemo(() => {
    return [{ value: "", label: "Select a card" }, ...state.domain.accountOrder
      .map((id) => state.domain.accountsById[id])
      .map((account) => ({ value: account.id, label: `${account.name || "Untitled card"} · ${account.issuer || "Issuer not set"}` }))];
  }, [state.domain.accountOrder, state.domain.accountsById]);

  const footer = useMemo(() => (
    <Stack direction="horizontal" justify="space-between" gap="sm">
      <Button variant="danger" disabled={!paymentId} onClick={() => {
        if (!paymentId) return;
        dispatch({ type: "payments/delete", payload: { paymentId } });
        dispatch({ type: "selection/selectPayment", payload: null });
        dispatch({ type: "editing/stop" });
      }}>Delete payment</Button>
      <Stack direction="horizontal" gap="sm">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!paymentId} onClick={() => {
          if (!paymentId) return;
          const nextErrors = validatePaymentForm(form);
          setErrors(nextErrors);
          if (Object.keys(nextErrors).length > 0) return;
          dispatch({ type: "payments/update", payload: { paymentId, patch: mapPaymentFormToInput(form) } });
          if (form.cardId) {
            dispatch({ type: "selection/selectAccount", payload: form.cardId });
            dispatch({ type: "inspector/open" });
          }
          dispatch({ type: "editing/stop" });
        }}>Save changes</Button>
      </Stack>
    </Stack>
  ), [dispatch, form, onClose, paymentId]);

  return (
    <EditSurface
      open={open}
      title="Edit payment"
      description="Update or delete a recorded payment event."
      footer={footer}
      onClose={onClose}
    >
      {payment ? (
        <Stack gap="md">
          <Select label="Card" value={form.cardId} options={cardOptions} onChange={(event) => setForm((current) => ({ ...current, cardId: event.target.value }))} errorText={errors.cardId} />
          <Stack direction="horizontal" gap="md" wrap="wrap">
            <Input label="Amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} errorText={errors.amount} />
            <Input label="Payment date" type="date" value={form.paymentDate} onChange={(event) => setForm((current) => ({ ...current, paymentDate: event.target.value }))} errorText={errors.paymentDate} />
          </Stack>
          <Select label="Payment type" value={form.paymentType} options={paymentTypeOptions} onChange={(event) => setForm((current) => ({ ...current, paymentType: event.target.value as PaymentFormState['paymentType'] }))} />
          <Input label="Notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} helperText="Optional note for this payment record." />
        </Stack>
      ) : (
        <p>No payment selected for editing.</p>
      )}
    </EditSurface>
  );
}
