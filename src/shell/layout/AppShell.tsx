import { useAppState } from "../../app/providers/AppProviders";
import { NavigationDestination } from "../../state/appState.types";
import { CenterWorkspace } from "./CenterWorkspace";
import { LeftNav } from "./LeftNav";
import { RightInspectorHost } from "./RightInspectorHost";
import { ShellFrame } from "./ShellFrame";
import { TopBar } from "./TopBar";
import { useShellLayout } from "../hooks/useShellLayout";

type AppShellProps = {
  activeDestination: NavigationDestination;
  screen: React.ReactNode;
};

export function AppShell({ activeDestination, screen }: AppShellProps) {
  const { state } = useAppState();
  const {
    navMode,
    inspectorPresentation,
    isMobileNavOpen,
    setIsMobileNavOpen,
    shellGridTemplateColumns,
  } = useShellLayout(activeDestination, state.ui);

  return (
    <ShellFrame gridTemplateColumns={shellGridTemplateColumns}>
      <div className="shell-frame__topbar">
        <TopBar
          activeDestination={activeDestination}
          navMode={navMode}
          inspectorPresentation={inspectorPresentation}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />
      </div>

      <div className="shell-frame__nav">
        <LeftNav
          mode={navMode}
          isMobileOpen={isMobileNavOpen}
          onCloseMobileNav={() => setIsMobileNavOpen(false)}
        />
      </div>

      <div className="shell-frame__center">
        <CenterWorkspace>{screen}</CenterWorkspace>
      </div>

      <div className="shell-frame__inspector">
        <RightInspectorHost presentation={inspectorPresentation} />
      </div>
    </ShellFrame>
  );
}
