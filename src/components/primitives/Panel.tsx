import { HTMLAttributes, ReactNode } from "react";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  padding?: "sm" | "md" | "lg";
};

export function Panel({
  children,
  className,
  title,
  description,
  actions,
  padding = "md",
  ...props
}: PanelProps) {
  const classes = ["ui-panel", `ui-panel--${padding}`, className ?? ""].filter(Boolean).join(" ");

  return (
    <section className={classes} {...props}>
      {title || description || actions ? (
        <header className="ui-panel__header">
          <div className="ui-panel__header-copy">
            {title ? <h2 className="ui-panel__title">{title}</h2> : null}
            {description ? <p className="ui-panel__description">{description}</p> : null}
          </div>
          {actions ? <div className="ui-panel__actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="ui-panel__body">{children}</div>
    </section>
  );
}
