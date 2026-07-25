import { forwardRef } from "react";
import type { PageSectionProps } from "../../types/page-section";
import { cn } from "../../utils/cn";
import "./styles/page-section.css";

export const PageSection = forwardRef<HTMLDivElement, PageSectionProps>(
  function PageSection(
    { classNames, className, children, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "clet-page-section",
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
