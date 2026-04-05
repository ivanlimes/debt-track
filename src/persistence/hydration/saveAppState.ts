import { DomainState } from "../../state/appState.types";
import { IndexedDbStorageAdapter } from "../indexeddb/indexedDbAdapter";
import { AccountRepository } from "../contracts/accountRepository";
import { PaymentRepository } from "../contracts/paymentRepository";
import { PayoffPlanRepository } from "../contracts/payoffPlanRepository";
import { PreferencesRepository } from "../contracts/preferencesRepository";
import { StorageAdapter } from "../contracts/storageAdapter";
import { IndexedDbAccountRepository } from "../indexeddb/repositories/indexedDbAccountRepository";
import { IndexedDbPaymentRepository } from "../indexeddb/repositories/indexedDbPaymentRepository";
import { IndexedDbPayoffPlanRepository } from "../indexeddb/repositories/indexedDbPayoffPlanRepository";
import { IndexedDbPreferencesRepository } from "../indexeddb/repositories/indexedDbPreferencesRepository";
import {
  AppMetaRecord,
  META_KEYS,
  PERSISTENCE_SCHEMA_VERSION,
  PersistenceMetadata,
  STORE_NAMES,
} from "../indexeddb/db.schema";
import { isRecord, isStringArray } from "../mappers/shared";

export const APP_PERSISTENCE_SCHEMA_VERSION = PERSISTENCE_SCHEMA_VERSION;

export class IndexedDbPersistenceGateway {
  readonly accounts: AccountRepository;
  readonly payments: PaymentRepository;
  readonly payoffPlan: PayoffPlanRepository;
  readonly preferences: PreferencesRepository;

  constructor(storageAdapter: StorageAdapter) {
    this.accounts = new IndexedDbAccountRepository(storageAdapter);
    this.payments = new IndexedDbPaymentRepository(storageAdapter);
    this.payoffPlan = new IndexedDbPayoffPlanRepository(storageAdapter);
    this.preferences = new IndexedDbPreferencesRepository(storageAdapter);
  }
}

function toOrderRecord(
  key: typeof META_KEYS.accountOrder | typeof META_KEYS.paymentOrder,
  value: string[],
): AppMetaRecord<string[]> {
  return {
    key,
    value,
  };
}

function toPersistenceMetadataRecord(
  value: PersistenceMetadata,
): AppMetaRecord<PersistenceMetadata> {
  return {
    key: META_KEYS.persistenceMetadata,
    value,
  };
}

export async function getStoredOrder(
  storageAdapter: StorageAdapter,
  key: typeof META_KEYS.accountOrder | typeof META_KEYS.paymentOrder,
): Promise<string[] | null> {
  const record = await storageAdapter.getOne<AppMetaRecord<unknown>>(STORE_NAMES.appMeta, key);

  if (!record || !isStringArray(record.value)) {
    return null;
  }

  return record.value;
}

export async function getPersistenceMetadata(
  storageAdapter: StorageAdapter,
): Promise<PersistenceMetadata | null> {
  const record = await storageAdapter.getOne<AppMetaRecord<unknown>>(
    STORE_NAMES.appMeta,
    META_KEYS.persistenceMetadata,
  );

  if (!record || !isRecord(record.value)) {
    return null;
  }

  const { schemaVersion, savedAt } = record.value;

  if (typeof schemaVersion !== "number" || !Number.isFinite(schemaVersion)) {
    return null;
  }

  if (typeof savedAt !== "string") {
    return null;
  }

  return {
    schemaVersion,
    savedAt,
  };
}

export async function savePersistedDomainState(domainState: DomainState): Promise<void> {
  const storageAdapter = new IndexedDbStorageAdapter();
  const gateway = new IndexedDbPersistenceGateway(storageAdapter);

  const accounts = domainState.accountOrder
    .map((accountId) => domainState.accountsById[accountId])
    .filter((account): account is NonNullable<typeof account> => Boolean(account));

  const payments = domainState.paymentOrder
    .map((paymentId) => domainState.paymentsById[paymentId])
    .filter((payment): payment is NonNullable<typeof payment> => Boolean(payment));

  await Promise.all([
    gateway.accounts.replaceAll(accounts),
    gateway.payments.replaceAll(payments),
    gateway.payoffPlan.save(domainState.activePayoffPlan),
    gateway.preferences.save(domainState.preferences),
    storageAdapter.put(
      STORE_NAMES.appMeta,
      toOrderRecord(META_KEYS.accountOrder, [...domainState.accountOrder]),
    ),
    storageAdapter.put(
      STORE_NAMES.appMeta,
      toOrderRecord(META_KEYS.paymentOrder, [...domainState.paymentOrder]),
    ),
    storageAdapter.put(
      STORE_NAMES.appMeta,
      toPersistenceMetadataRecord({
        schemaVersion: APP_PERSISTENCE_SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
      }),
    ),
  ]);
}
