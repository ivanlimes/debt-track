import { ButtonHTMLAttributes, ReactNode } from "react";
import { PrimitiveSize } from "../../theme/theme.types";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: PrimitiveSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export function Button({
  children,
  className,
  variant = "secondary",
  size = "md",
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  type = "button",
  ...buttonProps
}: ButtonProps) {
  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth ? "ui-button--full-width" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...buttonProps}>
      {leadingIcon ? <span className="ui-button__icon" aria-hidden="true">{leadingIcon}</span> : null}
      <span className="ui-button__label">{children}</span>
      {trailingIcon ? <span className="ui-button__icon" aria-hidden="true">{trailingIcon}</span> : null}
    </button>
  );
}
