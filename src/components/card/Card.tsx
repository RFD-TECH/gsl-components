import { forwardRef } from "react";
import type { CardProps, CardHeaderProps, CardTitleProps, CardActionsProps } from "../../types/card";
import { cn } from "../../utils/cn";
import { LogoLoader } from "../logo-loader";
import "./styles/card.css";

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    className,
    bordered,
    loading,
    loadingLabel,
    loadingMinHeight = "220px",
    children,
    style,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "clet-card gsl-card",
        bordered && "clet-card--bordered gsl-card--bordered",
        loading && "clet-card--loading gsl-card--loading",
        className,
      )}
      style={
        loading
          ? {
              minHeight:
                typeof loadingMinHeight === "number"
                  ? `${loadingMinHeight}px`
                  : loadingMinHeight,
              ...style,
            }
          : style
      }
      {...props}
    >
      {loading ? <LogoLoader label={loadingLabel} /> : children}
    </div>
  );
});

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("clet-card__header gsl-card__header", className)}
      {...props}
    >
      {children}
    </div>
  );
});

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, children, ...props },
  ref,
) {
  return (
    <h3
      ref={ref}
      className={cn("clet-card__title gsl-card__title", className)}
      {...props}
    >
      {children}
    </h3>
  );
});

export const CardActions = forwardRef<HTMLDivElement, CardActionsProps>(function CardActions(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("clet-card__actions gsl-card__actions", className)}
      {...props}
    >
      {children}
    </div>
  );
});
