import { ReactNode } from "react";

type ShellFrameProps = {
  children: ReactNode;
  gridTemplateColumns: string;
};

export function ShellFrame({ children, gridTemplateColumns }: ShellFrameProps) {
  return (
    <div
      className="shell-frame"
      style={{
        gridTemplateColumns,
      }}
    >
      {children}
    </div>
  );
}
