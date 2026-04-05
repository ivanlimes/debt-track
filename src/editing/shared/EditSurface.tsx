import { ReactNode } from "react";
import { Dialog } from "../../components/primitives/Dialog";
import { Stack } from "../../components/primitives/Stack";

type EditSurfaceProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
};

export function EditSurface({ open, title, description, children, footer, onClose }: EditSurfaceProps) {
  return (
    <Dialog open={open} title={title} description={description} footer={footer} onClose={onClose}>
      <Stack gap="md">{children}</Stack>
    </Dialog>
  );
}
