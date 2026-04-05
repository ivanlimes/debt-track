import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { loadPersistedDomainState } from "../../persistence/hydration/loadAppState";
import { savePersistedDomainState } from "../../persistence/hydration/saveAppState";
import {
  AppAction,
  appReducer,
  createInitialAppState,
} from "../../state/appStore";

type AppStateContextValue = {
  state: ReturnType<typeof createInitialAppState>;
  dispatch: React.Dispatch<AppAction>;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

function resolveThemeMode(themeMode: ReturnType<typeof createInitialAppState>["domain"]["preferences"]["themeMode"]) {
  if (themeMode === "system") {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return "dark" as const;
    }

    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" as const : "dark" as const;
  }

  return themeMode;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialAppState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    void (async () => {
      try {
        const persistedDomainState = await loadPersistedDomainState();

        if (!isCancelled && persistedDomainState) {
          dispatch({
            type: "domain/replace",
            payload: persistedDomainState,
          });
        }
      } catch (error) {
        console.error("Failed to hydrate persisted domain state.", error);
      } finally {
        if (!isCancelled) {
          setIsHydrated(true);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void savePersistedDomainState(state.domain).catch((error) => {
      console.error("Failed to persist domain state.", error);
    });
  }, [isHydrated, state.domain]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const applyResolvedTheme = () => {
      const resolvedTheme = resolveThemeMode(state.domain.preferences.themeMode);
      document.documentElement.dataset.theme = resolvedTheme;
      document.documentElement.dataset.layoutSurfaceColor =
        state.domain.preferences.layoutSurfaceColorPreference;
      document.documentElement.style.colorScheme = resolvedTheme;
    };

    applyResolvedTheme();

    if (
      state.domain.preferences.themeMode !== "system" ||
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => applyResolvedTheme();

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [
    state.domain.preferences.themeMode,
    state.domain.preferences.layoutSurfaceColorPreference,
  ]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  if (!isHydrated) {
    return null;
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppProviders.");
  }

  return context;
}
