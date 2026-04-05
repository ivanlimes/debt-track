import { useEffect, useMemo, useState } from "react";
import { NavigationDestination, UiState } from "../../state/appState.types";
import { SHELL_DIMENSIONS } from "../config/shell.constants";

type ShellNavMode = "expanded" | "rail" | "hidden";
type InspectorPresentation = "column" | "overlay" | "hidden";

function getViewportWidth() {
  if (typeof window === "undefined") {
    return 1440;
  }

  return window.innerWidth;
}

export function useShellLayout(
  activeDestination: NavigationDestination,
  uiState: UiState,
) {
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(getViewportWidth());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [activeDestination]);

  const navMode: ShellNavMode = useMemo(() => {
    if (viewportWidth <= SHELL_DIMENSIONS.mobileNavigationBreakpoint) {
      return "hidden";
    }

    if (viewportWidth <= SHELL_DIMENSIONS.leftNavCollapsedBreakpoint) {
      return "rail";
    }

    return "expanded";
  }, [viewportWidth]);

  const selectionRelevantDestinations =
    activeDestination === "cards" ||
    activeDestination === "dashboard" ||
    activeDestination === "calendar" ||
    activeDestination === "paymentPlan";

  const shouldShowInspectorContent =
    activeDestination !== "settings" && uiState.inspector.isOpen && selectionRelevantDestinations;

  const inspectorPresentation: InspectorPresentation = useMemo(() => {
    if (!shouldShowInspectorContent) {
      return "hidden";
    }

    if (viewportWidth <= SHELL_DIMENSIONS.inspectorOverlayBreakpoint) {
      return "overlay";
    }

    return "column";
  }, [shouldShowInspectorContent, viewportWidth]);

  const shellGridTemplateColumns = useMemo(() => {
    const leftColumn =
      navMode === "expanded"
        ? `${SHELL_DIMENSIONS.leftNavWidth}px`
        : navMode === "rail"
          ? `${SHELL_DIMENSIONS.leftNavRailWidth}px`
          : "0px";

    const rightColumn =
      inspectorPresentation === "column"
        ? `${SHELL_DIMENSIONS.inspectorWidth}px`
        : "0px";

    return `${leftColumn} minmax(0, 1fr) ${rightColumn}`;
  }, [inspectorPresentation, navMode]);

  return {
    viewportWidth,
    navMode,
    inspectorPresentation,
    isMobileNavOpen,
    setIsMobileNavOpen,
    shellGridTemplateColumns,
  };
}
