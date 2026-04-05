import { AppPreferences } from "../../../domain/preferences/preferences.types";
import { PreferencesRepository } from "../../contracts/preferencesRepository";
import { StorageAdapter } from "../../contracts/storageAdapter";
import { serializePreferences, deserializePreferences } from "../../mappers/serializePreferences";
import { STORE_NAMES } from "../db.schema";

export class IndexedDbPreferencesRepository implements PreferencesRepository {
  constructor(private readonly storageAdapter: StorageAdapter) {}

  async get(): Promise<AppPreferences | null> {
    const records = await this.storageAdapter.getAll<unknown>(STORE_NAMES.preferences);
    return deserializePreferences(records[0] ?? null);
  }

  async save(preferences: AppPreferences): Promise<void> {
    await this.storageAdapter.clear(STORE_NAMES.preferences);
    await this.storageAdapter.put(STORE_NAMES.preferences, serializePreferences(preferences));
  }
}
