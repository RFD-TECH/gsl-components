import { forwardRef, useState } from "react";
import type { AvatarProps, AvatarSize } from "../../types/avatar";
import { gradientFromString } from "../../utils/stringToColor";
import { cn } from "../../utils/cn";
import "./styles/avatar.css";

function nameToInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/* Only a numeric `size` needs this: the named sizes carry a class and are sized
   from the text tokens in avatar.css, so they follow the accessibility scale. */
function scaledInitialsSize(px: number): string {
  const base = Math.round(px * 0.38);
  return `calc(${base}px * var(--gsl-text-scale, var(--clet-text-scale, 1)))`;
}

function resolveSize(size: AvatarProps["size"]): number {
  if (typeof size === "number") return size;
  return sizeMap[size ?? "md"];
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 28,
  md: 36,
  lg: 48,
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { name, src, size = "md", background, backgroundVar, className, classNames, ...props },
  ref,
) {
  const initials = nameToInitials(name);
  const dimension = resolveSize(size);
  const [imgError, setImgError] = useState(false);

  const resolvedTheme =
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-clet-theme") ?? undefined
      : undefined;

  const gradient = gradientFromString(name, resolvedTheme);
  const resolvedBackground =
    background ?? (backgroundVar ? `var(${backgroundVar}, ${gradient})` : gradient);

  return (
    <div
      ref={ref}
      className={cn(
        "clet-avatar gsl-avatar",
        typeof size === "string" && `clet-avatar--${size}`,
        classNames?.root,
        className,
      )}
      style={{
        width: dimension,
        height: dimension,
      }}
      {...props}
    >
      {src && !imgError ? (
        <img
          className={cn("clet-avatar__image gsl-avatar__image", classNames?.image)}
          src={src}
          alt={name}
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className={cn("clet-avatar__initials gsl-avatar__initials", classNames?.initials)}
          style={{
            background: resolvedBackground,
            ...(typeof size === "number"
              ? { fontSize: scaledInitialsSize(dimension) }
              : null),
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
});
