import { ReactNode } from "react";
import { cn } from "@/components/layout/cn";

type SectionHeadingProps = {
  title: string;
  subtitle?: ReactNode;
  kicker?: string;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeading({
  title,
  subtitle,
  kicker,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div data-align={align} className={cn("section-heading", className)}>
      {kicker ? <p className="section-kicker">{kicker}</p> : null}
      <h2 className="section-title">{title}</h2>
      <div className="section-divider" />
      {subtitle ? <div className="section-copy">{subtitle}</div> : null}
    </div>
  );
}
