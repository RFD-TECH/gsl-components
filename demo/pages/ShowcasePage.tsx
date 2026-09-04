import { useMemo, type ComponentType, type ReactNode } from "react";
import {
  Avatar,
  Badge,
  Input,
  MetricCard,
  MetricCards,
  PageSection,
  SectionHeader,
  SectionTitle,
  SectionDescription,
  Textarea,
  useTheme,
} from "@rfdtech/components";

/* Every *Preview export in demo/docs/previews/code is a self-contained render of
   one component, so the kitchen sink assembles itself from them. */
const previewModules = import.meta.glob<Record<string, unknown>>(
  "../docs/previews/code/*.tsx",
  { eager: true },
);

type PreviewEntry = { name: string; Component: ComponentType };

/* Mounts an already-open Modal, which is right on its own docs page but here
   would drop a blocking overlay over every other component on the page. */
const EXCLUDED = new Set(["FormModalPreview"]);

function collectPreviews(): PreviewEntry[] {
  const entries: PreviewEntry[] = [];

  for (const module of Object.values(previewModules)) {
    for (const [name, value] of Object.entries(module)) {
      if (typeof value === "function" && name.endsWith("Preview") && !EXCLUDED.has(name)) {
        entries.push({ name, Component: value as ComponentType });
      }
    }
  }

  return entries.sort((left, right) => left.name.localeCompare(right.name));
}

function ShowcaseItem({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section className="showcase__item" data-showcase-item={name}>
      <h2 className="showcase__item-title">{name}</h2>
      <div className="showcase__item-canvas">{children}</div>
    </section>
  );
}

/* The library ships these with no docs preview to borrow, so they are rendered
   by hand to keep the sweep verification complete. */
function ExtrasPreview() {
  return (
    <div className="showcase__extras">
      <Avatar name="Ama Mensah" size="sm" />
      <Avatar name="Kwame Boateng" size="md" />
      <Avatar name="Efua Danso" size="lg" />
      <Badge>Badge</Badge>
      <Input placeholder="Input placeholder" />
      <Textarea placeholder="Textarea placeholder" />
    </div>
  );
}

function MetricCardsPreview() {
  return (
    <MetricCards>
      <MetricCard label="Total requests" value="1,284" />
      <MetricCard label="Open" value="97" />
      <MetricCard label="Resolved" value="1,187" />
    </MetricCards>
  );
}

export function ShowcasePage() {
  const previews = useMemo(collectPreviews, []);
  const { fontSize, resolvedTheme } = useTheme();

  return (
    <PageSection>
      <SectionHeader>
        <SectionTitle>Component showcase</SectionTitle>
        <SectionDescription>
          Every component the library ships, on one page. Change the text size from
          the header widget and every block below should move together.
        </SectionDescription>
      </SectionHeader>

      <p className="showcase__state" data-showcase-state>
        font-size: <strong>{fontSize}</strong> · theme: <strong>{resolvedTheme}</strong> ·
        previews: <strong>{previews.length + 2}</strong>
      </p>

      <div className="showcase">
        <ShowcaseItem name="Extras">
          <ExtrasPreview />
        </ShowcaseItem>
        <ShowcaseItem name="MetricCards">
          <MetricCardsPreview />
        </ShowcaseItem>
        {previews.map(({ name, Component }) => (
          <ShowcaseItem key={name} name={name}>
            <Component />
          </ShowcaseItem>
        ))}
      </div>
    </PageSection>
  );
}
