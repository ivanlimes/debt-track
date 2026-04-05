import { HTMLAttributes } from "react";
import { PrimitiveTone } from "../../theme/theme.types";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: PrimitiveTone;
};

export function Badge({ children, className, tone = "neutral", ...props }: BadgeProps) {
  const classes = ["ui-badge", `ui-badge--${tone}`, className ?? ""].filter(Boolean).join(" ");

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
