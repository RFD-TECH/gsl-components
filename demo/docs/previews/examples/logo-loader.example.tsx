import { useState } from "react";
import { Button, LogoLoader } from "@rfdtech/components";

export function LogoLoaderExample() {
  const [blocking, setBlocking] = useState<number | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%" }}>
      {/* Sizes — inline, the default variant */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "24px" }}>
        <LogoLoader size="sm" label="Small" />
        <LogoLoader size="md" label="Medium" />
        <LogoLoader size="lg" label="Large" />
      </div>

      {/* Explicit dimensions — the arc follows the mark */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "24px" }}>
        <LogoLoader width={44} label="44px" />
        <LogoLoader width={96} label="96px" />
      </div>

      {/* Speed and halo */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "24px" }}>
        <LogoLoader speed={0.5} label="speed 0.5" />
        <LogoLoader speed={2} label="speed 2" />
        <LogoLoader fadePulse label="fadePulse" />
        <LogoLoader fadePulse speed={2} label="fadePulse fast" />
        <LogoLoader pulse label="pulse" />
        <LogoLoader noHalo label="noHalo" />
        <LogoLoader noBorder label="noBorder" />
      </div>

      {/* fill — covers its own positioned parent */}
      <div
        style={{
          position: "relative",
          minHeight: "180px",
          padding: "16px",
          border: "1px solid var(--clet-border)",
          borderRadius: "var(--clet-radius-base)",
        }}
      >
        <p style={{ margin: 0, color: "var(--clet-text-muted)" }}>
          Section content sitting underneath the loader.
        </p>
        <LogoLoader variant="fill" size="sm" label="Loading section…" />
      </div>

      {/* fullscreen — blocks the whole viewport. `label` is any ReactNode, and
          `blur` controls how much the page behind it is obscured. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <Button onClick={() => setBlocking(0)}>Fullscreen, no blur</Button>
        <Button onClick={() => setBlocking(4)}>Fullscreen, default blur</Button>
        <Button onClick={() => setBlocking(12)}>Fullscreen, heavy blur</Button>
        {blocking === null ? null : (
          <div onClick={() => setBlocking(null)} role="presentation">
            <LogoLoader
              variant="fullscreen"
              blur={blocking}
              label={`Loading… blur ${blocking}px — click to dismiss`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
