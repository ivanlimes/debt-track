import { EmptyState } from "../components/primitives/EmptyState";

export function InspectorEmptyState() {
  return (
    <EmptyState
      title="Inspector"
      description="Select an account in the workspace to inspect details and use controlled edit actions."
      icon="→"
    />
  );
}
