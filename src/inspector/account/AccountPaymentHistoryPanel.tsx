import { useAppState } from "../../app/providers/AppProviders";
import { useWorkspaceActions } from "../../app/hooks/useWorkspaceActions";
import { Button } from "../../components/primitives/Button";
import { Panel } from "../../components/primitives/Panel";
import { Stack } from "../../components/primitives/Stack";
import { selectPaymentsForAccount } from "../../state/selectors/account.selectors";
import { formatCurrency } from "../../utils/currency";

export function AccountPaymentHistoryPanel({ accountId }: { accountId: string }) {
  const { state } = useAppState();
  const { editPayment } = useWorkspaceActions();
  const payments = selectPaymentsForAccount(state, accountId);

  return (
    <Panel title="Payment history" description={`${payments.length} recorded payment${payments.length === 1 ? "" : "s"}.`}>
      {payments.length === 0 ? (
        <p className="editing-helper-text">No payment history yet for this account.</p>
      ) : (
        <Stack gap="sm">
          {payments.slice(0, 6).map((payment) => (
            <div key={payment.id} className="editing-list-row">
              <div>
                <strong>{formatCurrency(payment.amount)}</strong>
                <p className="editing-helper-text">{payment.paymentDate} · {payment.paymentType}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => editPayment(payment.id)}>
                Edit
              </Button>
            </div>
          ))}
        </Stack>
      )}
    </Panel>
  );
}
