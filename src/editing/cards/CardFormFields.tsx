import { Button } from "../../components/primitives/Button";
import { Input } from "../../components/primitives/Input";
import { Panel } from "../../components/primitives/Panel";
import { Select } from "../../components/primitives/Select";
import { Stack } from "../../components/primitives/Stack";
import { balanceBucketTypeOptions, dayOfMonthOptions } from "./cardForm.fields";
import { BucketFormState, CardFormState, createEmptyBucketFormState } from "./cardForm.mapping";

type CardFormFieldsProps = {
  form: CardFormState;
  setForm: React.Dispatch<React.SetStateAction<CardFormState>>;
  errors: Record<string, string>;
};

function SplitBucketEditor({
  bucket,
  index,
  errors,
  onChange,
  onRemove,
}: {
  bucket: BucketFormState;
  index: number;
  errors: Record<string, string>;
  onChange: (patch: Partial<BucketFormState>) => void;
  onRemove: () => void;
}) {
  return (
    <Panel
      className="split-bucket-editor"
      title={bucket.label || `Bucket ${index + 1}`}
      description="One logical balance segment under this physical card."
      actions={
        <Button variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      }
      padding="md"
    >
      <Stack gap="md">
        <Stack direction="horizontal" gap="md" wrap="wrap">
          <Input
            label="Bucket label"
            value={bucket.label}
            onChange={(event) => onChange({ label: event.target.value })}
            errorText={errors[`balanceBuckets.${index}.label`]}
          />
          <Select
            label="Bucket type"
            value={bucket.bucketType}
            options={balanceBucketTypeOptions}
            onChange={(event) => onChange({ bucketType: event.target.value as BucketFormState["bucketType"] })}
          />
        </Stack>

        <Stack direction="horizontal" gap="md" wrap="wrap">
          <Input
            label="Bucket balance"
            type="number"
            min="0"
            step="0.01"
            value={bucket.currentBalance}
            onChange={(event) => onChange({ currentBalance: event.target.value })}
            errorText={errors[`balanceBuckets.${index}.currentBalance`]}
          />
          <Input
            label="Bucket APR"
            type="number"
            min="0"
            step="0.01"
            value={bucket.apr}
            onChange={(event) => onChange({ apr: event.target.value })}
            errorText={errors[`balanceBuckets.${index}.apr`]}
          />
        </Stack>

        <label className="editing-toggle">
          <input
            type="checkbox"
            checked={bucket.hasPromoApr}
            onChange={(event) =>
              onChange({
                hasPromoApr: event.target.checked,
                promoApr: event.target.checked ? bucket.promoApr : "",
                promoEndDate: event.target.checked ? bucket.promoEndDate : "",
                aprAfterPromo: event.target.checked ? bucket.aprAfterPromo : "",
                isDeferredInterest: event.target.checked ? bucket.isDeferredInterest : false,
              })
            }
          />
          <span>Bucket promo treatment</span>
        </label>

        {bucket.hasPromoApr ? (
          <>
            <Stack direction="horizontal" gap="md" wrap="wrap">
              <Input
                label="Bucket promo APR"
                type="number"
                min="0"
                step="0.01"
                value={bucket.promoApr}
                onChange={(event) => onChange({ promoApr: event.target.value })}
                errorText={errors[`balanceBuckets.${index}.promoApr`]}
              />
              <Input
                label="Bucket promo end date"
                type="date"
                value={bucket.promoEndDate}
                onChange={(event) => onChange({ promoEndDate: event.target.value })}
                errorText={errors[`balanceBuckets.${index}.promoEndDate`]}
              />
              <Input
                label="Bucket APR after promo"
                type="number"
                min="0"
                step="0.01"
                value={bucket.aprAfterPromo}
                onChange={(event) => onChange({ aprAfterPromo: event.target.value })}
                errorText={errors[`balanceBuckets.${index}.aprAfterPromo`]}
              />
            </Stack>

            <label className="editing-toggle">
              <input
                type="checkbox"
                checked={bucket.isDeferredInterest}
                onChange={(event) => onChange({ isDeferredInterest: event.target.checked })}
              />
              <span>Deferred-interest bucket</span>
            </label>
          </>
        ) : null}

        <Input
          label="Bucket notes"
          value={bucket.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          helperText="Optional internal note for this bucket."
        />
      </Stack>
    </Panel>
  );
}

export function CardFormFields({ form, setForm, errors }: CardFormFieldsProps) {
  const hasDeferredBucket = form.hasSplitBalances && form.balanceBuckets.some((bucket) => bucket.isDeferredInterest);

  return (
    <Stack gap="md">
      <Stack direction="horizontal" gap="md" wrap="wrap">
        <Input label="Card name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} errorText={errors.name} />
        <Input label="Issuer" value={form.issuer} onChange={(event) => setForm((current) => ({ ...current, issuer: event.target.value }))} errorText={errors.issuer} />
      </Stack>

      <label className="editing-toggle">
        <input type="checkbox" checked={form.hasSplitBalances} onChange={(event) => setForm((current) => ({
          ...current,
          hasSplitBalances: event.target.checked,
          balanceBuckets: event.target.checked
            ? current.balanceBuckets.length > 0
              ? current.balanceBuckets
              : [createEmptyBucketFormState(0)]
            : current.balanceBuckets,
        }))} />
        <span>Split balance mode</span>
      </label>

      {form.hasSplitBalances ? (
        <Panel
          title="Balance buckets"
          description="Keep one physical card, but define the internal purchase / transfer / cash-advance balances explicitly so interest and payoff math stay accurate."
          padding="md"
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setForm((current) => ({
                ...current,
                balanceBuckets: [...current.balanceBuckets, createEmptyBucketFormState(current.balanceBuckets.length)],
              }))}
            >
              Add bucket
            </Button>
          }
        >
          <Stack gap="md">
            {errors.balanceBuckets ? <p className="ui-field__message ui-field__message--error">{errors.balanceBuckets}</p> : null}
            <p className="split-bucket-editor__note">Card-level balance and APR become roll-up outputs when split mode is active. Minimum payment and due timing stay card-level.</p>
            {form.balanceBuckets.map((bucket, index) => (
              <SplitBucketEditor
                key={bucket.id}
                bucket={bucket}
                index={index}
                errors={errors}
                onChange={(patch) =>
                  setForm((current) => ({
                    ...current,
                    balanceBuckets: current.balanceBuckets.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, ...patch } : item,
                    ),
                  }))
                }
                onRemove={() =>
                  setForm((current) => ({
                    ...current,
                    balanceBuckets: current.balanceBuckets.filter((_, itemIndex) => itemIndex !== index),
                  }))
                }
              />
            ))}
          </Stack>
        </Panel>
      ) : (
        <>
          <Stack direction="horizontal" gap="md" wrap="wrap">
            <Input label="Current balance" type="number" min="0" step="0.01" value={form.currentBalance} onChange={(event) => setForm((current) => ({ ...current, currentBalance: event.target.value }))} errorText={errors.currentBalance} />
            <Input label="Credit limit" type="number" min="1" step="0.01" value={form.creditLimit} onChange={(event) => setForm((current) => ({ ...current, creditLimit: event.target.value }))} errorText={errors.creditLimit} />
          </Stack>

          <Stack direction="horizontal" gap="md" wrap="wrap">
            <Input label="Standard APR" type="number" min="0" step="0.01" value={form.standardApr} onChange={(event) => setForm((current) => ({ ...current, standardApr: event.target.value }))} errorText={errors.standardApr} />
            <Input label="Minimum payment" type="number" min="0" step="0.01" value={form.minimumPayment} onChange={(event) => setForm((current) => ({ ...current, minimumPayment: event.target.value }))} errorText={errors.minimumPayment} />
          </Stack>
        </>
      )}

      {form.hasSplitBalances ? (
        <Stack direction="horizontal" gap="md" wrap="wrap">
          <Input label="Credit limit" type="number" min="1" step="0.01" value={form.creditLimit} onChange={(event) => setForm((current) => ({ ...current, creditLimit: event.target.value }))} errorText={errors.creditLimit} />
          <Input label="Minimum payment" type="number" min="0" step="0.01" value={form.minimumPayment} onChange={(event) => setForm((current) => ({ ...current, minimumPayment: event.target.value }))} errorText={errors.minimumPayment} />
        </Stack>
      ) : null}

      <Stack direction="horizontal" gap="md" wrap="wrap">
        <Select label="Due day" value={form.dueDayOfMonth} options={dayOfMonthOptions} onChange={(event) => setForm((current) => ({ ...current, dueDayOfMonth: event.target.value }))} errorText={errors.dueDayOfMonth} />
        <Select label="Statement day" value={form.statementDayOfMonth} options={[{ value: "", label: "Unknown" }, ...dayOfMonthOptions]} onChange={(event) => setForm((current) => ({ ...current, statementDayOfMonth: event.target.value }))} errorText={errors.statementDayOfMonth} />
      </Stack>

      <Stack direction="horizontal" gap="md" wrap="wrap">
        <Input label="Last payment date" type="date" value={form.lastPaymentDate} onChange={(event) => setForm((current) => ({ ...current, lastPaymentDate: event.target.value }))} errorText={errors.lastPaymentDate} />
        <Input label="Last known statement date" type="date" value={form.lastKnownStatementDate} onChange={(event) => setForm((current) => ({ ...current, lastKnownStatementDate: event.target.value }))} errorText={errors.lastKnownStatementDate} />
      </Stack>

      {!form.hasSplitBalances ? (
        <>
          <label className="editing-toggle">
            <input type="checkbox" checked={form.hasPromoApr} onChange={(event) => setForm((current) => ({
              ...current,
              hasPromoApr: event.target.checked,
              promoApr: event.target.checked ? current.promoApr : "",
              promoEndDate: event.target.checked ? current.promoEndDate : "",
              aprAfterPromo: event.target.checked ? current.aprAfterPromo : "",
              isDeferredInterest: event.target.checked ? current.isDeferredInterest : false,
              deferredInterestAprBasis: event.target.checked ? current.deferredInterestAprBasis : "",
              deferredInterestStartDate: event.target.checked ? current.deferredInterestStartDate : "",
            }))} />
            <span>Promo APR active</span>
          </label>

          {form.hasPromoApr ? (
            <>
              <Stack direction="horizontal" gap="md" wrap="wrap">
                <Input label="Promo APR" type="number" min="0" step="0.01" value={form.promoApr} onChange={(event) => setForm((current) => ({ ...current, promoApr: event.target.value }))} errorText={errors.promoApr} />
                <Input label="Promo end date" type="date" value={form.promoEndDate} onChange={(event) => setForm((current) => ({ ...current, promoEndDate: event.target.value }))} errorText={errors.promoEndDate} />
                <Input label="APR after promo" type="number" min="0" step="0.01" value={form.aprAfterPromo} onChange={(event) => setForm((current) => ({ ...current, aprAfterPromo: event.target.value }))} errorText={errors.aprAfterPromo} />
              </Stack>

              <label className="editing-toggle">
                <input type="checkbox" checked={form.isDeferredInterest} onChange={(event) => setForm((current) => ({
                  ...current,
                  isDeferredInterest: event.target.checked,
                  deferredInterestAprBasis: event.target.checked ? current.deferredInterestAprBasis : "",
                  deferredInterestStartDate: event.target.checked ? current.deferredInterestStartDate : "",
                }))} />
                <span>Deferred-interest promo</span>
              </label>
            </>
          ) : null}
        </>
      ) : null}

      {(!form.hasSplitBalances && form.isDeferredInterest) || hasDeferredBucket ? (
        <Stack direction="horizontal" gap="md" wrap="wrap">
          <Input
            label={form.hasSplitBalances ? "Deferred-interest start date (shared)" : "Deferred-interest start date"}
            type="date"
            value={form.deferredInterestStartDate}
            onChange={(event) => setForm((current) => ({ ...current, deferredInterestStartDate: event.target.value }))}
            errorText={errors.deferredInterestStartDate}
            helperText={form.hasSplitBalances ? "Shared promo-start reference used to estimate deferred-interest exposure for deferred buckets." : "Used to estimate the retroactive-interest window if the promo is not cleared in time."}
          />
          <Input
            label={form.hasSplitBalances ? "Deferred-interest APR basis (shared)" : "Deferred-interest APR basis"}
            type="number"
            min="0"
            step="0.01"
            value={form.deferredInterestAprBasis}
            onChange={(event) => setForm((current) => ({ ...current, deferredInterestAprBasis: event.target.value }))}
            errorText={errors.deferredInterestAprBasis}
            helperText={form.hasSplitBalances ? "Optional shared APR basis override for deferred-interest buckets." : "Optional override when the issuer applies a different deferred-interest APR basis."}
          />
        </Stack>
      ) : null}

      <Stack direction="horizontal" gap="md" wrap="wrap">
        <Input label="Annual fee" type="number" min="0" step="0.01" value={form.annualFee} onChange={(event) => setForm((current) => ({ ...current, annualFee: event.target.value }))} errorText={errors.annualFee} />
        <Input label="Notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} helperText="Optional internal note." />
      </Stack>
    </Stack>
  );
}
