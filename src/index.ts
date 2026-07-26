import "./styles/theme.css";

// Set the default adapter BEFORE any component/hook code runs.
import { setRouterAdapter } from "./adapters/registry";
import { useReactRouterAdapter } from "./adapters/react-router-adapter";
setRouterAdapter(useReactRouterAdapter);

export * from "./components/theme";
export * from "./components/app-switcher";
export * from "./components/launchpad";
export * from "./components/app-header";
export * from "./components/app-layout";
export * from "./components/avatar";
export * from "./components/badge";
export * from "./components/breadcrumb";
export * from "./components/bulk-import-modal";
export * from "./components/button";
export * from "./components/card";
export * from "./components/checkbox";
export * from "./components/combobox";
export * from "./components/command";
export * from "./components/country-selector";
export * from "./components/date-selector";
export * from "./components/table";
export * from "./components/field";
export * from "./components/form";
export * from "./components/input";
export * from "./components/otp-input";
export * from "./components/page-section";
export * from "./components/phone-number-input";
export * from "./components/date-range-selector";
export * from "./components/dialog";
export * from "./components/draggable";
export * from "./components/dropdown";
export * from "./components/export-button";
export * from "./components/metric-card";
export * from "./components/metric-cards";
export * from "./components/modal";
export * from "./components/network-operator";
export * from "./components/notice";
export * from "./components/popover";
export * from "./components/popup";
export * from "./components/quick-actions";
export * from "./components/profile-popover";
export * from "./components/progress-bar";
export * from "./components/radio-group";
export * from "./components/role-select";
export * from "./components/section-header";
export * from "./components/sheet";
export * from "./components/sidebar";
export * from "./components/sortable";
export * from "./components/stepper";
export * from "./components/switch";
export * from "./components/tabs";
export * from "./components/timeline";
export * from "./components/textarea";
export * from "./components/toast";
export * from "./components/tooltip";
export * from "./components/upload-field";
export * from "./contexts/router-adapter-context";
export * from "./hooks";
export {
  stringToHue,
  gradientFromString,
  vividGradientFromString,
  patternIndexFromString,
  gradientIndexFromString,
  overlayIndexFromString,
} from "./utils/stringToColor";
export {
  exportToCsv,
  exportToXlsx,
  exportToPdf,
  formatFilenameTimestamp,
} from "./utils/export";
export type { ExportMeta } from "./utils/export";
