import { createAppPreferences } from "../../domain/preferences/preferences.defaults";
import { createPayoffPlan } from "../../domain/payoff-plan/payoffPlan.defaults";
import { DomainState } from "../../state/appState.types";
import { IndexedDbStorageAdapter } from "../indexeddb/indexedDbAdapter";
import {
  APP_PERSISTENCE_SCHEMA_VERSION,
  IndexedDbPersistenceGateway,
  getPersistenceMetadata,
  getStoredOrder,
} from "./saveAppState";

function buildRecordMap<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

function reconcileStoredOrder(storedOrder: string[] | null, ids: string[]): string[] {
  const uniqueIds = [...new Set(ids)];

  if (!storedOrder || storedOrder.length === 0) {
    return [...uniqueIds];
  }

  const validIds = new Set(uniqueIds);
  const orderedVisibleIds: string[] = [];

  for (const id of storedOrder) {
    if (validIds.has(id) && !orderedVisibleIds.includes(id)) {
      orderedVisibleIds.push(id);
    }
  }

  const missingIds = uniqueIds.filter((id) => !orderedVisibleIds.includes(id));

  return [...orderedVisibleIds, ...missingIds];
}

function sanitizeCustomPriorityOrder(accountIds: string[], customPriorityOrder: string[]) {
  const validIds = new Set(accountIds);
  const sanitized: string[] = [];

  for (const id of customPriorityOrder) {
    if (validIds.has(id) && !sanitized.includes(id)) {
      sanitized.push(id);
    }
  }

  return sanitized;
}

function hasPersistedDomainData(params: {
  accountCount: number;
  paymentCount: number;
  hasPlan: boolean;
  hasPreferences: boolean;
  hasAccountOrder: boolean;
  hasPaymentOrder: boolean;
  hasMetadata: boolean;
}): boolean {
  return (
    params.accountCount > 0 ||
    params.paymentCount > 0 ||
    params.hasPlan ||
    params.hasPreferences ||
    params.hasAccountOrder ||
    params.hasPaymentOrder ||
    params.hasMetadata
  );
}

export async function loadPersistedDomainState(): Promise<DomainState | null> {
  const storageAdapter = new IndexedDbStorageAdapter();
  const gateway = new IndexedDbPersistenceGateway(storageAdapter);

  const [accounts, payments, activePlan, preferences, accountOrder, paymentOrder, metadata] =
    await Promise.all([
      gateway.accounts.listAll(),
      gateway.payments.listAll(),
      gateway.payoffPlan.getActive(),
      gateway.preferences.get(),
      getStoredOrder(storageAdapter, "accountOrder"),
      getStoredOrder(storageAdapter, "paymentOrder"),
      getPersistenceMetadata(storageAdapter),
    ]);

  if (metadata && metadata.schemaVersion !== APP_PERSISTENCE_SCHEMA_VERSION) {
    return null;
  }

  if (
    !hasPersistedDomainData({
      accountCount: accounts.length,
      paymentCount: payments.length,
      hasPlan: activePlan !== null,
      hasPreferences: preferences !== null,
      hasAccountOrder: accountOrder !== null,
      hasPaymentOrder: paymentOrder !== null,
      hasMetadata: metadata !== null,
    })
  ) {
    return null;
  }

  const resolvedAccountOrder = reconcileStoredOrder(
    accountOrder,
    accounts.map((account) => account.id),
  );

  return {
    accountsById: buildRecordMap(accounts),
    accountOrder: resolvedAccountOrder,
    paymentsById: buildRecordMap(payments),
    paymentOrder: reconcileStoredOrder(
      paymentOrder,
      payments.map((payment) => payment.id),
    ),
    activePayoffPlan: activePlan
      ? {
          ...activePlan,
          customPriorityOrder: sanitizeCustomPriorityOrder(resolvedAccountOrder, activePlan.customPriorityOrder),
        }
      : createPayoffPlan(),
    preferences: preferences ?? createAppPreferences(),
  };
}
