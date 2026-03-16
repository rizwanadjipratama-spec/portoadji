import { ReactNode } from "react";
import { cn } from "@/components/layout/cn";

type SectionShellProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  withDivider?: boolean;
};

export default function SectionShell({
  id,
  children,
  className,
  contentClassName,
  withDivider = true,
}: SectionShellProps) {
  return (
    <div id={id} className={cn("w-full", withDivider && "section-band", className)}>
      <div className={cn("site-container", contentClassName)}>{children}</div>
    </div>
  );
}
