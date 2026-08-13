import { forwardRef, isValidElement, useEffect, useMemo, useState } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { MetricCardProps, MetricTrend } from "../../types/metric-card";
import { cn } from "../../utils/cn";
import { MARKS, pickMark } from "./marks";
import "./styles/metric-card.css";

const trendIcons: Record<MetricTrend, typeof ArrowUp> = {
  up: ArrowUp,
  down: ArrowDown,
  neutral: Minus,
};

// Outline variant uses literal triangle/dash glyphs instead of icon components.
const outlineTrendGlyphs: Record<MetricTrend, string> = {
  up: "▲",
  down: "▼",
  neutral: "–",
};

interface ParsedValue {
  num: number;
  prefix: string;
  suffix: string;
  decimals: number;
  localeFormat: boolean;
}

function parseValueForAnimation(value: string | number): ParsedValue | null {
  if (typeof value === "number") {
    return {
      num: value,
      prefix: "",
      suffix: "",
      decimals: 0,
      localeFormat: false,
    };
  }
  const cleaned = value.replace(/,/g, "");
  const hadCommas = value !== cleaned;
  const match = cleaned.match(/^([^0-9.-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  return {
    num: parseFloat(match[2]),
    prefix: match[1],
    suffix: match[3],
    decimals: match[2].split(".")[1]?.length ?? 0,
    localeFormat: hadCommas,
  };
}

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  function MetricCard(
    {
      label,
      value,
      icon,
      description,
      variant = "default",
      mark,
      trend,
      trendValue,
      animate = false,
      animationDuration = 1500,
      loading = false,
      loadingLabel = "Loading metric",
      className,
      classNames,
      ...props
    },
    ref,
  ) {
    const isOutline = variant === "outline";

    // Only the soft variant carries a watermark. `mark` is either an id from
    // the bundled set, a node of your own, or false to opt out; with none of
    // those, the label picks one so a row of cards spreads across the set
    // without anyone naming them.
    const markNode = useMemo(() => {
      if (variant !== "soft" || mark === false) return null;
      if (isValidElement(mark)) return mark;
      const id =
        typeof mark === "string" && mark in MARKS
          ? (mark as keyof typeof MARKS)
          : pickMark(label);
      return <img src={MARKS[id]} alt="" aria-hidden />;
    }, [variant, mark, label]);
    const TrendIcon = trend && !isOutline ? trendIcons[trend] : null;
    const trendGlyph = trend && isOutline ? outlineTrendGlyphs[trend] : null;

    // Outline variant drops the leading +/- from the trend value.

    const displayTrendValue =
      isOutline && trendValue ? trendValue.replace(/^[+-]/, "") : trendValue;

    const parsed = useMemo(
      () => (animate ? parseValueForAnimation(value) : null),
      [animate, value],
    );

    const [animatedNum, setAnimatedNum] = useState(0);

    useEffect(() => {
      if (!parsed) {
        setAnimatedNum(0);
        return;
      }

      const from = 0;
      const to = parsed.num;

      if (from === to) {
        setAnimatedNum(to);
        return;
      }

      const startTime = performance.now();
      let rafId: number;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        // Cubic ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedNum(from + (to - from) * eased);
        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        }
      };

      rafId = requestAnimationFrame(step);
      return () => cancelAnimationFrame(rafId);
    }, [parsed, animationDuration]);

    let displayValue: string | number = value;
    if (parsed) {
      const formatted = parsed.localeFormat
        ? animatedNum.toLocaleString("en-US", {
            minimumFractionDigits: parsed.decimals,
            maximumFractionDigits: parsed.decimals,
          })
        : animatedNum.toFixed(parsed.decimals);
      displayValue = `${parsed.prefix}${formatted}${parsed.suffix}`;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "clet-metric-card gsl-metric-card",
          `clet-metric-card--${variant} gsl-metric-card--${variant}`,
          loading && "clet-metric-card--loading gsl-metric-card--loading",
          classNames?.root,
          className,
        )}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span className="clet-metric-card__sr-only gsl-metric-card__sr-only" role="status">
            {loadingLabel}
          </span>
        ) : null}

        <div className="clet-metric-card__header gsl-metric-card__header" aria-hidden={loading || undefined}>
          {icon ? (
            loading ? (
              <span className="clet-skeleton gsl-skeleton clet-metric-card__skeleton-icon gsl-metric-card__skeleton-icon" />
            ) : (
              <span className={cn("clet-metric-card__icon gsl-metric-card__icon", classNames?.icon)}>
                {icon}
              </span>
            )
          ) : null}
          {loading ? (
            <span className="clet-skeleton gsl-skeleton clet-metric-card__skeleton-label gsl-metric-card__skeleton-label" />
          ) : (
            <span className={cn("clet-metric-card__label gsl-metric-card__label", classNames?.label)}>
              {label}
            </span>
          )}
        </div>

        <div
          className="clet-metric-card__value-row gsl-metric-card__value-row"
          aria-hidden={loading || undefined}
        >
          {loading ? (
            <span className="clet-skeleton gsl-skeleton clet-metric-card__skeleton-value gsl-metric-card__skeleton-value" />
          ) : (
            <span className={cn("clet-metric-card__value gsl-metric-card__value", classNames?.value)}>
              {displayValue}
            </span>
          )}

          {trend && trendValue ? (
            loading ? (
              <span className="clet-skeleton gsl-skeleton clet-metric-card__skeleton-trend gsl-metric-card__skeleton-trend" />
            ) : (
              <span
                className={cn(
                  "clet-metric-card__trend gsl-metric-card__trend",
                  `clet-metric-card__trend--${trend} gsl-metric-card__trend--${trend}`,
                  classNames?.trend,
                )}
              >
                {TrendIcon ? (
                  <TrendIcon size={14} strokeWidth={2.5} aria-hidden />
                ) : null}
                {trendGlyph ? (
                  <span className="clet-metric-card__trend-glyph gsl-metric-card__trend-glyph" aria-hidden>
                    {trendGlyph}
                  </span>
                ) : null}
                {displayTrendValue}
              </span>
            )
          ) : null}
        </div>

        {description ? (
          loading ? (
            <span
              className="clet-skeleton gsl-skeleton clet-metric-card__skeleton-description gsl-metric-card__skeleton-description"
              aria-hidden
            />
          ) : (
            <span
              className={cn(
                "clet-metric-card__description gsl-metric-card__description",
                classNames?.description,
              )}
            >
              {description}
            </span>
          )
        ) : null}

        {markNode ? (
          <span
            className={cn("clet-metric-card__mark gsl-metric-card__mark", classNames?.mark)}
            aria-hidden
          >
            {markNode}
          </span>
        ) : null}
      </div>
    );
  },
);
