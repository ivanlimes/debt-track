import { useAppState } from "../../app/providers/AppProviders";
import { NavigationDestination } from "../../state/appState.types";
import { shellDestinations } from "../config/destinations";

type LeftNavProps = {
  mode: "expanded" | "rail" | "hidden";
  isMobileOpen: boolean;
  onCloseMobileNav: () => void;
};

export function LeftNav({ mode, isMobileOpen, onCloseMobileNav }: LeftNavProps) {
  const { state, dispatch } = useAppState();
  const isHidden = mode === "hidden";

  return (
    <>
      {isHidden && isMobileOpen ? <div className="shell-overlay" onClick={onCloseMobileNav} aria-hidden="true" /> : null}
      <nav
        className={[
          "shell-nav",
          mode === "rail" ? "shell-nav--rail" : "",
          isHidden ? "shell-nav--mobile" : "",
          isHidden && isMobileOpen ? "shell-nav--mobile-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Primary navigation"
      >
        <div className="shell-nav__brand">
          <div className="shell-nav__brand-mark" aria-hidden="true">
            DC
          </div>
          {mode !== "rail" ? (
            <div className="shell-nav__brand-copy">
              <strong>Debt Command Center</strong>
              <span>V1 shell frame</span>
            </div>
          ) : null}
        </div>

        <ul className="shell-nav__list">
          {shellDestinations.map((destination) => {
            const isActive = state.ui.navigation.activeDestination === destination.id;

            return (
              <li key={destination.id}>
                <button
                  type="button"
                  className={isActive ? "shell-nav__item shell-nav__item--active" : "shell-nav__item"}
                  onClick={() => {
                    dispatch({
                      type: "navigation/setDestination",
                      payload: destination.id as NavigationDestination,
                    });
                    onCloseMobileNav();
                  }}
                  aria-current={isActive ? "page" : undefined}
                  title={destination.label}
                >
                  <span className="shell-nav__item-icon" aria-hidden="true">
                    {destination.shortLabel}
                  </span>
                  {mode !== "rail" ? <span>{destination.label}</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
