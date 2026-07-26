import type { HTMLAttributes } from "react";

export interface MetricCardsClassNames {
  root?: string;
}

export interface MetricCardsProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: MetricCardsClassNames;
  className?: string;
}
