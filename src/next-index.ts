import "./styles/theme.css";

// The Next.js entry uses the context-only adapter, which requires a
// `<RouterAdapterProvider>` in the consumer's component tree.
import { setRouterAdapter } from "./adapters/registry";
import { useContextRouterAdapter } from "./adapters/context-adapter";
setRouterAdapter(useContextRouterAdapter);

export * from "./components/theme";
export * from "./components/app-switcher";
export * from "./components/app-header";
export * from "./components/app-layout";
export * from "./components/avatar";
export * from "./components/badge";
export * from "./components/breadcrumb";
export * from "./components/bulk-import-modal";
export * from "./components/button";
export * from "./components/card";
export * from "./components/checkbox";
export * from "./components/command";
export * from "./components/country-selector";
export * from "./components/date-selector";
export * from "./components/table";
export * from "./components/field";
export * from "./components/form";
export * from "./components/input";
export * from "./components/otp-input";
export * from "./components/phone-number-input";
export * from "./components/date-range-selector";
export * from "./components/dialog";
export * from "./components/draggable";
export * from "./components/dropdown";
export * from "./components/metric-card";
export * from "./components/modal";
export * from "./components/network-operator";
export * from "./components/popover";
export * from "./components/progress-bar";
export * from "./components/radio-group";
export * from "./components/sheet";
export * from "./components/sidebar";
export * from "./components/sortable";
export * from "./components/tabs";
export * from "./components/textarea";
export * from "./components/toast";
export * from "./components/tooltip";
export * from "./components/upload-field";
export * from "./hooks";
export { stringToHue, gradientFromString } from "./utils/stringToColor";

// Re-export RouterAdapterProvider for Next.js consumers to use
export { RouterAdapterProvider } from "./contexts/router-adapter-context";

// Re-export the Next.js adapter hook
export { useNextRouterAdapter } from "./adapters/next-adapter";
