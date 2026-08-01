import { TimeSelector } from "@rfdtech/components";

export function TimeSelectorExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300 }}>
      <TimeSelector variant="wheel" defaultValue={{ hours: 3, minutes: 12 }} />
      <TimeSelector variant="clock" defaultValue={{ hours: 2, minutes: 0 }} />
      <TimeSelector invalid />
      <TimeSelector disabled />
    </div>
  );
}
