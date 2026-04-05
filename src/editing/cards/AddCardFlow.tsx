import { useEffect, useMemo, useState } from "react";
import { useAppState } from "../../app/providers/AppProviders";
import { Button } from "../../components/primitives/Button";
import { Stack } from "../../components/primitives/Stack";
import { EditSurface } from "../shared/EditSurface";
import { CardFormFields } from "./CardFormFields";
import { CardFormState, createCardFormState, mapCardFormToInput, validateCardForm } from "./cardForm.mapping";

export function AddCardFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useAppState();
  const [form, setForm] = useState<CardFormState>(() => createCardFormState());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(createCardFormState());
      setErrors({});
    }
  }, [open]);

  const footer = useMemo(() => (
    <Stack direction="horizontal" justify="flex-end" gap="sm">
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant="primary" onClick={() => {
        const nextErrors = validateCardForm(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;
        dispatch({ type: "accounts/create", payload: mapCardFormToInput(form) });
        dispatch({ type: "editing/stop" });
      }}>Save card</Button>
    </Stack>
  ), [dispatch, form, onClose]);

  return (
    <EditSurface
      open={open}
      title="Add card"
      description="Enter raw account facts only. Split-balance mode keeps one physical card while letting you model multiple internal APR buckets explicitly."
      footer={footer}
      onClose={onClose}
    >
      <CardFormFields form={form} setForm={setForm} errors={errors} />
    </EditSurface>
  );
}
