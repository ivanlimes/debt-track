import { EditingHost } from "../editing/EditingHost";
import { AppShell } from "../shell/layout/AppShell";
import { screenRegistry } from "../screens/registry";
import { useAppState } from "./providers/AppProviders";

export function App() {
  const { state } = useAppState();
  const ActiveScreen = screenRegistry[state.ui.navigation.activeDestination];

  return (
    <>
      <AppShell activeDestination={state.ui.navigation.activeDestination} screen={<ActiveScreen />} />
      <EditingHost />
    </>
  );
}
