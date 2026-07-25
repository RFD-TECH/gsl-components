import type { HTMLAttributes } from "react";

export interface PageSectionClassNames {
  root?: string;
}

export interface PageSectionProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: PageSectionClassNames;
  className?: string;
}
