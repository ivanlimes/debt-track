import { useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "../../app/providers/AppProviders";
import { Button } from "../../components/primitives/Button";
import { Input } from "../../components/primitives/Input";
import { Select } from "../../components/primitives/Select";
import { Stack } from "../../components/primitives/Stack";
import { EditSurface } from "../shared/EditSurface";
import { paymentTypeOptions } from "./paymentForm.fields";
import { PaymentFormState, createPaymentFormState, mapPaymentFormToInput, validatePaymentForm } from "./paymentForm.mapping";

export function AddPaymentFlow({ open, defaultCardId, onClose }: { open: boolean; defaultCardId?: string | null; onClose: () => void }) {
  const { state, dispatch } = useAppState();
  const buildQuickForm = () => ({
    ...createPaymentFormState(null, defaultCardId ?? undefined),
    paymentType: "extra" as PaymentFormState["paymentType"],
  });
  const [form, setForm] = useState<PaymentFormState>(() => buildQuickForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFullDetails, setShowFullDetails] = useState(false);
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setForm(buildQuickForm());
      setErrors({});
      setShowFullDetails(false);
    }
  }, [defaultCardId, open]);

  useEffect(() => {
    if (!open) return;
    const handle = window.setTimeout(() => {
      amountInputRef.current?.focus();
      amountInputRef.current?.select();
    }, 0);
    return () => window.clearTimeout(handle);
  }, [open]);

  const cardOptions = useMemo(() => {
    return [{ value: "", label: "Select a card" }, ...state.domain.accountOrder
      .map((id) => state.domain.accountsById[id])
      .filter((account) => !account.isClosed)
      .map((account) => ({ value: account.id, label: `${account.name || "Untitled card"} · ${account.issuer || "Issuer not set"}` }))];
  }, [state.domain.accountOrder, state.domain.accountsById]);

  const footer = useMemo(() => (
    <Stack direction="horizontal" justify="space-between" gap="sm" wrap="wrap">
      <Button
        variant="ghost"
        onClick={() => {
          setShowFullDetails((current) => !current);
          if (showFullDetails) {
            setForm((current) => ({ ...current, paymentType: "extra", notes: current.notes }));
          }
        }}
      >
        {showFullDetails ? "Simple entry" : "More details"}
      </Button>
      <Stack direction="horizontal" justify="flex-end" gap="sm">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => {
          const nextErrors = validatePaymentForm(form);
          setErrors(nextErrors);
          if (Object.keys(nextErrors).length > 0) return;
          dispatch({ type: "payments/create", payload: mapPaymentFormToInput(form) });
          if (form.cardId) {
            dispatch({ type: "selection/selectAccount", payload: form.cardId });
            dispatch({ type: "inspector/open" });
          }
          dispatch({ type: "editing/stop" });
        }}>Save extra payment</Button>
      </Stack>
    </Stack>
  ), [dispatch, form, onClose, showFullDetails]);

  return (
    <EditSurface
      open={open}
      title="Add extra payment"
      description="Fast entry for an extra payment. Use More details only when you need a different payment type or want to add notes."
      footer={footer}
      onClose={onClose}
    >
      <Stack gap="md">
        <div className="quick-payment-flow__header">
          <span className="quick-payment-flow__pill">Payment type · Extra payment</span>
          <p className="quick-payment-flow__supporting">Save a real PaymentRecord without leaving your current destination.</p>
        </div>
        <Select label="Card" value={form.cardId} options={cardOptions} onChange={(event) => setForm((current) => ({ ...current, cardId: event.target.value }))} errorText={errors.cardId} helperText={defaultCardId ? "Prefilled from your current card context." : "Choose the card this extra payment belongs to."} />
        <Stack direction="horizontal" gap="md" wrap="wrap">
          <Input ref={amountInputRef} autoFocus label="Amount" type="number" min="0.01" step="0.01" inputMode="decimal" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} errorText={errors.amount} helperText="Primary field for quick-entry." />
          <Input label="Payment date" type="date" value={form.paymentDate} onChange={(event) => setForm((current) => ({ ...current, paymentDate: event.target.value }))} errorText={errors.paymentDate} helperText="Defaults to today for the fast extra-payment path." />
        </Stack>
        {showFullDetails ? (
          <Stack gap="md">
            <Select label="Payment type" value={form.paymentType} options={paymentTypeOptions} onChange={(event) => setForm((current) => ({ ...current, paymentType: event.target.value as PaymentFormState['paymentType'] }))} helperText="Change this only if you need a different payment record type." />
            <Input label="Notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} helperText="Optional note for this payment record." />
          </Stack>
        ) : null}
      </Stack>
    </EditSurface>
  );
}
