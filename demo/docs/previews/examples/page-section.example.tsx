import {
  PageSection,
  SectionHeader,
  SectionTitle,
  SectionDescription,
  Card,
} from "@rfdtech/components";

export function PageSectionExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, width: "100%" }}>
      <PageSection>
        <SectionHeader>
          <SectionTitle>Dashboard</SectionTitle>
          <SectionDescription>
            Sections are separated by consistent vertical gap.
          </SectionDescription>
        </SectionHeader>
      </PageSection>

      <PageSection>
        <div
          style={{
            height: 80,
            borderRadius: "var(--clet-radius-xl)",
            border: "1px dashed var(--clet-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "var(--clet-text-secondary)",
          }}
        >
          Metric cards or stats grid
        </div>
      </PageSection>

      <PageSection>
        <Card bordered>
          <div
            style={{
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: "var(--clet-text-secondary)",
            }}
          >
            Table or content area
          </div>
        </Card>
      </PageSection>
    </div>
  );
}
