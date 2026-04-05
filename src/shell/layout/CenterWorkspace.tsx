import { ReactNode } from "react";

type CenterWorkspaceProps = {
  children: ReactNode;
};

export function CenterWorkspace({ children }: CenterWorkspaceProps) {
  return (
    <main className="shell-center" aria-label="Center workspace">
      <div className="shell-center__content">{children}</div>
    </main>
  );
}
