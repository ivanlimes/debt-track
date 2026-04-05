import { ReactNode } from "react";

type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
};

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="ui-empty-state" role="status" aria-live="polite">
      {icon ? <div className="ui-empty-state__icon" aria-hidden="true">{icon}</div> : null}
      <div className="ui-empty-state__copy">
        <h2 className="ui-empty-state__title">{title}</h2>
        {description ? <p className="ui-empty-state__description">{description}</p> : null}
      </div>
      {action ? <div className="ui-empty-state__action">{action}</div> : null}
    </div>
  );
}
