import { useAppState } from "../../app/providers/AppProviders";
import { Button } from "../../components/primitives/Button";
import { InspectorRouter } from "../../inspector/InspectorRouter";

type RightInspectorHostProps = {
  presentation: "column" | "overlay" | "hidden";
};

export function RightInspectorHost({ presentation }: RightInspectorHostProps) {
  const { dispatch } = useAppState();

  if (presentation === "hidden") {
    return null;
  }

  return (
    <aside
      className={presentation === "overlay" ? "shell-inspector shell-inspector--overlay" : "shell-inspector"}
      aria-label="Right inspector"
    >
      <div className="shell-inspector__header">
        <div>
          <p className="shell-inspector__eyebrow">Selected card</p>
          <h2 className="shell-inspector__title">Details</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "inspector/close" })}>
          Close
        </Button>
      </div>
      <div className="shell-inspector__content">
        <InspectorRouter />
      </div>
    </aside>
  );
}
