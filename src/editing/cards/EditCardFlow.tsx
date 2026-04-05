import { useEffect, useMemo, useState } from "react";
import { useAppState } from "../../app/providers/AppProviders";
import { Button } from "../../components/primitives/Button";
import { Stack } from "../../components/primitives/Stack";
import { EditSurface } from "../shared/EditSurface";
import { CardFormFields } from "./CardFormFields";
import { CardFormState, createCardFormState, mapCardFormToInput, validateCardForm } from "./cardForm.mapping";

export function EditCardFlow({ open, accountId, onClose }: { open: boolean; accountId: string | null; onClose: () => void }) {
  const { state, dispatch } = useAppState();
  const account = accountId ? state.domain.accountsById[accountId] ?? null : null;
  const [form, setForm] = useState<CardFormState>(() => createCardFormState(account));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(createCardFormState(account));
    setErrors({});
  }, [account]);

  const footer = useMemo(() => (
    <Stack direction="horizontal" justify="flex-end" gap="sm">
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant="primary" disabled={!accountId} onClick={() => {
        if (!accountId) return;
        const nextErrors = validateCardForm(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;
        dispatch({ type: "accounts/update", payload: { accountId, patch: mapCardFormToInput(form) } });
        dispatch({ type: "editing/stop" });
      }}>Save changes</Button>
    </Stack>
  ), [accountId, dispatch, form, onClose]);

  return (
    <EditSurface
      open={open}
      title="Edit card"
      description="Update raw account facts. Split-balance mode keeps bucket administration explicit so card-level rollups and interest math stay trustworthy."
      footer={footer}
      onClose={onClose}
    >
      {account ? <CardFormFields form={form} setForm={setForm} errors={errors} /> : <p>No account selected for editing.</p>}
    </EditSurface>
  );
}
