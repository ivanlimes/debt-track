import { useEffect, useMemo, useState } from "react";
import { useAppState } from "../../app/providers/AppProviders";
import { Button } from "../../components/primitives/Button";
import { Input } from "../../components/primitives/Input";
import { Select } from "../../components/primitives/Select";
import { Stack } from "../../components/primitives/Stack";
import { EditSurface } from "../shared/EditSurface";
import { payoffStrategyOptions } from "./payoffPlanForm.fields";
import { PayoffPlanFormState, createPayoffPlanFormState, mapPayoffPlanFormToInput, validatePayoffPlanForm } from "./payoffPlanForm.mapping";

export function EditPayoffPlanFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useAppState();
  const openAccounts = useMemo(() => state.domain.accountOrder
    .map((id) => state.domain.accountsById[id])
    .filter((account) => !account.isClosed), [state.domain.accountOrder, state.domain.accountsById]);

  const [form, setForm] = useState<PayoffPlanFormState>(() => createPayoffPlanFormState(state.domain.activePayoffPlan));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(createPayoffPlanFormState(state.domain.activePayoffPlan));
    setErrors({});
  }, [state.domain.activePayoffPlan]);

  const footer = useMemo(() => (
    <Stack direction="horizontal" justify="flex-end" gap="sm">
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant="primary" onClick={() => {
        const nextErrors = validatePayoffPlanForm(form, openAccounts.map((account) => account.id));
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;
        dispatch({ type: "payoffPlan/update", payload: mapPayoffPlanFormToInput(form) });
        dispatch({ type: "editing/stop" });
      }}>Save plan</Button>
    </Stack>
  ), [dispatch, form, onClose, openAccounts]);

  return (
    <EditSurface
      open={open}
      title="Edit payoff plan"
      description="Update strategy inputs. Ranking and projections refresh after save."
      footer={footer}
      onClose={onClose}
    >
      <Stack gap="md">
        <Select label="Strategy" value={form.strategy} options={payoffStrategyOptions} onChange={(event) => setForm((current) => ({ ...current, strategy: event.target.value as PayoffPlanFormState['strategy'] }))} />
        <Stack direction="horizontal" gap="md" wrap="wrap">
          <Input label="Extra payment amount" type="number" min="0" step="0.01" value={form.extraPaymentAmount} onChange={(event) => setForm((current) => ({ ...current, extraPaymentAmount: event.target.value }))} errorText={errors.extraPaymentAmount} />
          <Input label="Monthly debt budget" type="number" min="0" step="0.01" value={form.monthlyDebtBudget} onChange={(event) => setForm((current) => ({ ...current, monthlyDebtBudget: event.target.value }))} errorText={errors.monthlyDebtBudget} helperText="Optional total monthly debt budget." />
        </Stack>
        <label className="editing-toggle">
          <input type="checkbox" checked={form.useMinimumsFirst} onChange={(event) => setForm((current) => ({ ...current, useMinimumsFirst: event.target.checked }))} />
          <span>Apply minimums first before extra money</span>
        </label>

        {form.strategy === "custom" ? (
          <div className="editing-priority-list">
            <div>
              <strong>Custom priority order</strong>
              <p className="editing-helper-text">Use the controls to set which open card should get extra money first.</p>
            </div>
            {openAccounts.length === 0 ? <p className="editing-helper-text">Add an open account before creating a custom priority order.</p> : null}
            {openAccounts.map((account) => {
              const included = form.customPriorityOrder.includes(account.id);
              return (
                <label key={account.id} className="editing-check-row">
                  <input
                    type="checkbox"
                    checked={included}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setForm((current) => ({
                        ...current,
                        customPriorityOrder: checked
                          ? [...current.customPriorityOrder, account.id]
                          : current.customPriorityOrder.filter((id) => id !== account.id),
                      }));
                    }}
                  />
                  <span>{account.name || "Untitled card"} · {account.issuer || "Issuer not set"}</span>
                </label>
              );
            })}
            {errors.customPriorityOrder ? <p className="ui-field__message ui-field__message--error">{errors.customPriorityOrder}</p> : null}
          </div>
        ) : null}
      </Stack>
    </EditSurface>
  );
}
