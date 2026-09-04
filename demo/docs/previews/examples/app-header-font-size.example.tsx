import {
  AppHeader,
  AppHeaderActions,
  AppHeaderBranding,
  AppHeaderFontSize,
  AppHeaderNotifications,
} from "@rfdtech/components";

export function AppHeaderFontSizeExample() {
  return (
    <AppHeader variant="plain">
      <AppHeaderBranding title="CLET Portal" subtitle="Component Library" />
      <AppHeaderActions>
        <AppHeaderFontSize />
        <AppHeaderNotifications />
      </AppHeaderActions>
    </AppHeader>
  );
}
