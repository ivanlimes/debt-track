import { cardsSortOptions } from "../cards/cards.options";

export const settingsThemeOptions = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
] as const;

export const settingsCurrencyOptions = [
  { value: "USD", label: "USD · US Dollar" },
  { value: "CAD", label: "CAD · Canadian Dollar" },
  { value: "EUR", label: "EUR · Euro" },
  { value: "GBP", label: "GBP · British Pound" },
] as const;

export const settingsSortOptions = cardsSortOptions;


export const settingsLayoutSurfaceColorOptions = [
  { value: "default", label: "Default" },
  { value: "neutral", label: "Neutral" },
  { value: "slate", label: "Slate" },
  { value: "steel_blue", label: "Steel blue" },
  { value: "muted_teal", label: "Muted teal" },
  { value: "dark_plum", label: "Dark plum" },
] as const;
