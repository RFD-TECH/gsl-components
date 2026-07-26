import { forwardRef } from "react";
import type { MetricCardsProps } from "../../types/metric-cards";
import { cn } from "../../utils/cn";
import "./styles/metric-cards.css";

export const MetricCards = forwardRef<HTMLDivElement, MetricCardsProps>(
  function MetricCards(
    { classNames, className, children, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "clet-metric-cards",
          classNames?.root,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
