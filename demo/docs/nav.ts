export interface DocNavItem {
	slug: string;
	title: string;
}

export interface DocNavSection {
	title: string;
	items: DocNavItem[];
}

export const docNavSections: DocNavSection[] = [
	{
		title: "Guide",
		items: [
			{ slug: "getting-started", title: "Getting started" },
			{ slug: "hooks", title: "Hooks" },
			{ slug: "theme", title: "Theme" },
			{ slug: "router-adapter", title: "RouterAdapter" },
			{ slug: "changelog", title: "Changelog" },
			{ slug: "migration-v2", title: "Migration guide: v1 → v2" },
		],
	},
	{
		title: "Components",
		items: [
			{ slug: "app-header", title: "AppHeader" },
			{ slug: "app-layout", title: "AppLayout" },
			{ slug: "app-switcher", title: "AppSwitcher (Deprecated)" },
			{ slug: "badge", title: "Badge" },
			{ slug: "breadcrumb", title: "Breadcrumb" },
			{ slug: "bulk-import-modal", title: "BulkImportModal" },
			{ slug: "button", title: "Button" },
			{ slug: "card", title: "Card" },
			{ slug: "checkbox", title: "Checkbox" },
			{ slug: "combobox", title: "Combobox" },
			{ slug: "command", title: "Command" },
			{ slug: "dashboard-patterns", title: "Dashboard patterns" },
			{ slug: "country-selector", title: "CountrySelector (Deprecated)" },
			{ slug: "date-selector", title: "DateSelector" },
			{ slug: "date-range-selector", title: "DateRangeSelector" },
			{ slug: "dialog", title: "Dialog" },
			{ slug: "draggable", title: "Draggable" },
			{ slug: "dropdown", title: "Dropdown" },
			{ slug: "export-button", title: "ExportButton" },
			{ slug: "form", title: "Form" },
			{ slug: "form-field", title: "FormField" },
			{ slug: "launchpad", title: "Launchpad" },
			{ slug: "logo-loader", title: "LogoLoader" },
			{ slug: "metric-card", title: "MetricCard" },
			{ slug: "modal", title: "Modal" },
			{ slug: "network-operator", title: "NetworkOperator" },
			{ slug: "page-section", title: "PageSection" },
			{ slug: "notice", title: "Notice" },
			{ slug: "otp-input", title: "OtpInput" },
			{ slug: "phone-number-input", title: "PhoneNumberInput" },
			{ slug: "popover", title: "Popover" },
			{ slug: "popup", title: "Popup" },
			{ slug: "quick-actions", title: "QuickActions" },
			{ slug: "profile-popover", title: "ProfilePopover" },
			{ slug: "progress-bar", title: "ProgressBar" },
			{ slug: "radio-group", title: "RadioGroup" },
			{ slug: "role-select", title: "RoleSelect" },
			{ slug: "section-header", title: "SectionHeader" },
			{ slug: "sheet", title: "Sheet" },
			{ slug: "sidebar", title: "Sidebar" },
			{ slug: "sortable", title: "Sortable" },
			{ slug: "stepper", title: "Stepper" },
			{ slug: "switch", title: "Switch" },
			{ slug: "table", title: "Table" },
			{ slug: "tabs", title: "Tabs" },
			{ slug: "time-selector", title: "TimeSelector" },
			{ slug: "timeline", title: "Timeline" },
			{ slug: "toast", title: "Toast" },
			{ slug: "tooltip", title: "Tooltip" },
			{ slug: "upload-field", title: "UploadField" },
		],
	},
];
