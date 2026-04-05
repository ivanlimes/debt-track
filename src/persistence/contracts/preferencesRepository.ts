import { AppPreferences } from "../../domain/preferences/preferences.types";

export interface PreferencesRepository {
  get(): Promise<AppPreferences | null>;
  save(preferences: AppPreferences): Promise<void>;
}
