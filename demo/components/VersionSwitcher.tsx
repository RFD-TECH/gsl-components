import { Dropdown } from "@rfdtech/components";
import { useNavigate } from "react-router-dom";

const VERSIONS = [
  { value: "v2_3", label: "v2.3.0", path: "/" },
  { value: "v2_2", label: "v2.2.0", path: "/v2" },
  // Last v1 release before the 2.0.0 rebrand
  { value: "v1_22", label: "v1.22.0", path: "/legacy" },
] as const;

export type VersionSwitcherValue = (typeof VERSIONS)[number]["value"];

interface VersionSwitcherProps {
  active: VersionSwitcherValue;
}

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
