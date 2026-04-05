import { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { StackGap } from "../../theme/theme.types";

type StackProps = HTMLAttributes<HTMLDivElement> & {
  direction?: "vertical" | "horizontal";
  gap?: StackGap;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: CSSProperties["flexWrap"];
  children?: ReactNode;
};

const gapMap: Record<StackGap, string> = {
  xs: "var(--space-xs)",
  sm: "var(--space-sm)",
  md: "var(--space-md)",
  lg: "var(--space-lg)",
  xl: "var(--space-xl)",
};

export function Stack({
  className,
  direction = "vertical",
  gap = "md",
  align,
  justify,
  wrap,
  style,
  children,
  ...props
}: StackProps) {
  return (
    <div
      className={[
        "ui-stack",
        direction === "horizontal" ? "ui-stack--horizontal" : "ui-stack--vertical",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...style,
        gap: gapMap[gap],
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
