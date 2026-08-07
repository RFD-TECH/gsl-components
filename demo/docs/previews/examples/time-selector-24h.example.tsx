import { TimeSelector } from "@rfdtech/components";

export function TimeSelector24hExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300 }}>
      <TimeSelector
        variant="wheel"
        hourCycle={24}
        minuteStep={15}
        defaultValue={{ hours: 14, minutes: 30 }}
      />
      <TimeSelector
        variant="clock"
        hourCycle={24}
        defaultValue={{ hours: 18, minutes: 45 }}
      />
    </div>
  );
}
