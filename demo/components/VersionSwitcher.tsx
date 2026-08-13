import { Dropdown } from "@rfdtech/components";
import { useNavigate } from "react-router-dom";

// Each entry is a live shell, not a changelog entry: the layout composition
// the design system shipped at that version, kept runnable so all three can be
// compared side by side.
const VERSIONS = [
  { value: "v2_3", label: "v2.3.0", path: "/" },
  { value: "v2_2", label: "v2.2.0", path: "/v2" },
  // Last v1 release before the 2.0.0 new-design-system rebrand (see CHANGELOG.md)
  { value: "v1_22", label: "v1.22.0", path: "/legacy" },
] as const;

export type VersionSwitcherValue = (typeof VERSIONS)[number]["value"];

interface VersionSwitcherProps {
  active: VersionSwitcherValue;
}

/**
 * Jumps the demo between the shells each design system version shipped:
 * 2.3's primary rail at "/", 2.2's full-width brand header at "/v2", and the
 * pre-rebrand 1.22 panels at "/legacy".
 */
export function VersionSwitcher({ active }: VersionSwitcherProps) {
  const navigate = useNavigate();

  return (
    <Dropdown
      value={active}
      onValueChange={(value) => {
        const match = VERSIONS.find((version) => version.value === value);
        if (match) navigate(match.path);
      }}
      options={VERSIONS.map(({ value, label }) => ({ value, label }))}
      clearable={false}
      aria-label="Design system version"
    />
  );
}
