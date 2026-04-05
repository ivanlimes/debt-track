import { useMemo } from "react";
import { useAppState } from "../../app/providers/AppProviders";
import { Badge } from "../../components/primitives/Badge";
import { Button } from "../../components/primitives/Button";
import { Panel } from "../../components/primitives/Panel";
import { Select } from "../../components/primitives/Select";
import { Stack } from "../../components/primitives/Stack";
import { LayoutSurfaceColorPreference, ThemeMode } from "../../domain/shared/enums";
import { selectAccounts, selectPayments } from "../../state/selectors/account.selectors";
import {
  settingsCurrencyOptions,
  settingsLayoutSurfaceColorOptions,
  settingsSortOptions,
  settingsThemeOptions,
} from "./settings.options";


const paletteToneLabels: Record<LayoutSurfaceColorPreference, string> = {
  default: "Default",
  neutral: "Neutral",
  slate: "Slate",
  steel_blue: "Steel blue",
  muted_teal: "Muted teal",
  dark_plum: "Dark plum",
};

export function SettingsScreen() {
  const { state, dispatch } = useAppState();
  const preferences = state.domain.preferences;
  const accounts = useMemo(() => selectAccounts(state), [state]);
  const payments = useMemo(() => selectPayments(state), [state]);

  const openAccounts = accounts.filter((account) => !account.isClosed).length;
  const closedAccounts = accounts.filter((account) => account.isClosed).length;

  const updateThemeMode = (themeMode: ThemeMode) => {
    dispatch({ type: "preferences/update", payload: { themeMode } });
  };

  const updateCurrencyCode = (currencyCode: string) => {
    dispatch({ type: "preferences/update", payload: { currencyCode } });
  };

  const updateLayoutSurfaceColorPreference = (
    layoutSurfaceColorPreference: LayoutSurfaceColorPreference,
  ) => {
    dispatch({ type: "preferences/update", payload: { layoutSurfaceColorPreference } });
  };

  const updateDefaultSort = (defaultSort: typeof preferences.defaultSort) => {
    dispatch({ type: "preferences/update", payload: { defaultSort } });
  };

  const updateClosedAccountPreference = (showClosedAccounts: boolean) => {
    dispatch({
      type: "preferences/update",
      payload: {
        showClosedAccounts,
        defaultFilter: showClosedAccounts ? "closed_accounts" : "all_open",
      },
    });
  };

  return (
    <section className="settings-screen">
      <header className="settings-screen__hero">
        <div>
          <h1>Settings</h1>
          <p>
            Settings stays narrow and app-level: control display preferences, the default Cards
            sort order, and whether closed-account history should be surfaced by default.
          </p>
        </div>
      </header>

      <div className="settings-screen__layout">
        <Panel
          title="Appearance"
          description="These preferences change how the workspace presents app-level information without changing debt facts."
          padding="lg"
        >
          <div className="settings-screen__form-grid">
            <Select
              label="Theme mode"
              value={preferences.themeMode}
              options={settingsThemeOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              onChange={(event) => updateThemeMode(event.target.value as ThemeMode)}
              helperText="System follows your device preference."
            />

            <Select
              label="Currency"
              value={preferences.currencyCode}
              options={settingsCurrencyOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              onChange={(event) => updateCurrencyCode(event.target.value)}
              helperText="All totals, interest estimates, and plan outputs use this display currency."
            />

          </div>

          <div className="settings-toggle-card" role="group" aria-labelledby="surface-palette-label">
            <div className="settings-toggle-card__copy">
              <div className="settings-toggle-card__title-row">
                <h3 id="surface-palette-label">Layout / surface palette</h3>
                <Badge tone="accent">{paletteToneLabels[preferences.layoutSurfaceColorPreference]}</Badge>
              </div>
              <p>
                Choose one restrained surface family. Theme mode still controls whether that family
                renders in light, dark, or system-following form.
              </p>
            </div>

            <Select
              label="Surface family"
              value={preferences.layoutSurfaceColorPreference}
              options={settingsLayoutSurfaceColorOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              onChange={(event) =>
                updateLayoutSurfaceColorPreference(
                  event.target.value as LayoutSurfaceColorPreference,
                )
              }
              helperText="Applies the existing curated palette system across supported shell and content surfaces."
            />
          </div>
        </Panel>

        <Panel
          title="Cards defaults"
          description="These preferences control the default comparison behavior when you open the Cards destination."
          padding="lg"
        >
          <div className="settings-screen__form-grid settings-screen__form-grid--single">
            <Select
              label="Default sort"
              value={preferences.defaultSort}
              options={settingsSortOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              onChange={(event) => updateDefaultSort(event.target.value as typeof preferences.defaultSort)}
              helperText="Cards uses this sort when the screen loads or when defaults are reset from preferences."
            />
          </div>

          <div className="settings-toggle-card" role="group" aria-labelledby="closed-account-default-label">
            <div className="settings-toggle-card__copy">
              <div className="settings-toggle-card__title-row">
                <h3 id="closed-account-default-label">Closed-account visibility</h3>
                <Badge tone={preferences.showClosedAccounts ? "accent" : "neutral"}>
                  {preferences.showClosedAccounts ? "Showing closed history by default" : "Open accounts by default"}
                </Badge>
              </div>
              <p>
                This preference controls whether the Cards screen opens on the historical closed-account
                view or the active open-account view.
              </p>
            </div>

            <Stack direction="horizontal" gap="sm" wrap="wrap">
              <Button
                variant={preferences.showClosedAccounts ? "primary" : "secondary"}
                onClick={() => updateClosedAccountPreference(true)}
              >
                Show closed accounts by default
              </Button>
              <Button
                variant={!preferences.showClosedAccounts ? "primary" : "secondary"}
                onClick={() => updateClosedAccountPreference(false)}
              >
                Prefer open accounts
              </Button>
            </Stack>
          </div>
        </Panel>

        <Panel
          title="Local data"
          description="This app is local-first. Data persists in this browser and restores on reload without a backend."
          padding="lg"
        >
          <div className="settings-summary-grid">
            <div className="settings-summary-card">
              <span className="settings-summary-card__label">Open accounts</span>
              <strong>{openAccounts}</strong>
              <p>Accounts currently included in active payoff and timing calculations.</p>
            </div>

            <div className="settings-summary-card">
              <span className="settings-summary-card__label">Closed accounts</span>
              <strong>{closedAccounts}</strong>
              <p>Historical accounts retained for context instead of being silently deleted.</p>
            </div>

            <div className="settings-summary-card">
              <span className="settings-summary-card__label">Payment records</span>
              <strong>{payments.length}</strong>
              <p>Recorded payment events currently preserved in the local-first store.</p>
            </div>
          </div>

          <div className="settings-local-note">
            <Badge tone="accent">Local-only</Badge>
            <p>
              Changes save automatically in this browser. Export/import and broader release controls are
              still later-stage work, not part of this screen slice.
            </p>
          </div>
        </Panel>
      </div>
    </section>
  );
}
