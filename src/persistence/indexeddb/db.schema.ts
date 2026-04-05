export const APP_DB_NAME = "debt-command-center";
export const APP_DB_VERSION = 1;
export const PERSISTENCE_SCHEMA_VERSION = 1;

export const STORE_NAMES = {
  accounts: "accounts",
  payments: "payments",
  payoffPlans: "payoffPlans",
  preferences: "preferences",
  appMeta: "appMeta",
} as const;

export const META_KEYS = {
  accountOrder: "accountOrder",
  paymentOrder: "paymentOrder",
  persistenceMetadata: "persistenceMetadata",
} as const;

export type MetaKey = (typeof META_KEYS)[keyof typeof META_KEYS];

export type AppMetaRecord<TValue> = {
  key: MetaKey;
  value: TValue;
};

export type PersistenceMetadata = {
  schemaVersion: number;
  savedAt: string;
};
