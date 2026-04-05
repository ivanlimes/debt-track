import { ReactNode, useEffect } from "react";

type DialogProps = {
  open: boolean;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
};

export function Dialog({ open, title, description, children, footer, onClose }: DialogProps) {
  useEffect(() => {
    if (!open || !onClose) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="ui-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="ui-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        {title || description ? (
          <header className="ui-dialog__header">
            {title ? <h2 className="ui-dialog__title">{title}</h2> : null}
            {description ? <p className="ui-dialog__description">{description}</p> : null}
          </header>
        ) : null}
        <div className="ui-dialog__body">{children}</div>
        {footer ? <footer className="ui-dialog__footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
