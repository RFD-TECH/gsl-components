import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Launchpad } from "./Launchpad";
import { SystemLaunchpadIcon } from "./SystemLaunchpadIcon";
import { RoleSelect } from "../role-select/RoleSelect";
import type { LaunchpadApp } from "../../types/launchpad";

const staticApps: LaunchpadApp[] = [
	{
		id: "mail",
		name: "Mail",
		icon: <SystemLaunchpadIcon name="Mail" />,
		href: "https://mail.example.com",
	},
];

function roleSelect() {
	return (
		<RoleSelect
			title="View as"
			roles={[{ id: "admin", name: "Admin" }]}
			selectedRole="admin"
			onClickRole={() => {}}
		/>
	);
}

describe("Launchpad", () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it("renders static apps when the panel is opened, under the fixed Launchpad title", async () => {
		const user = userEvent.setup();

		render(<Launchpad apps={staticApps}>{roleSelect()}</Launchpad>);

		await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

		expect(screen.getByText("Launchpad")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /Mail/i })).toBeInTheDocument();
	});

	it("calls onAppSelect when a static app is chosen", async () => {
		const user = userEvent.setup();
		const onAppSelect = vi.fn();

		render(
			<Launchpad apps={staticApps} onAppSelect={onAppSelect}>
				{roleSelect()}
			</Launchpad>,
		);

		await user.click(screen.getByRole("button", { name: "Open Launchpad" }));
		await user.click(screen.getByRole("link", { name: /Mail/i }));

		expect(onAppSelect).toHaveBeenCalledWith(
			expect.objectContaining({ id: "mail", name: "Mail" }),
		);
	});

	it("shows a grid skeleton (no apps) when loading is true", async () => {
		const user = userEvent.setup();

		render(
			<Launchpad apps={[]} loading>
				{roleSelect()}
			</Launchpad>,
		);

		await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

		const skeletonGrid = document.querySelector(
			".clet-launchpad__grid[aria-busy='true']",
		);
		expect(skeletonGrid).toBeInTheDocument();
		expect(
			skeletonGrid?.querySelectorAll(".clet-launchpad__skeleton-item"),
		).toHaveLength(9);
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
	});

	it("renders apps on the shared gradient/overlay tile system, capped at 9", async () => {
		const user = userEvent.setup();
		const apps: LaunchpadApp[] = Array.from({ length: 12 }, (_, i) => ({
			id: `app-${i}`,
			name: `App ${i}`,
			icon: <SystemLaunchpadIcon name={`App ${i}`} />,
		}));

		render(<Launchpad apps={apps}>{roleSelect()}</Launchpad>);

		await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

		expect(document.querySelectorAll(".clet-launchpad__tile")).toHaveLength(9);
	});

	it("shows an empty message when not loading and apps is empty", async () => {
		const user = userEvent.setup();

		render(<Launchpad apps={[]}>{roleSelect()}</Launchpad>);

		await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

		expect(screen.getByText("No systems available.")).toBeInTheDocument();
	});

	it("renders the top-right expand button (always, regardless of app count)", async () => {
		const user = userEvent.setup();

		render(<Launchpad apps={staticApps}>{roleSelect()}</Launchpad>);

		await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

		expect(
			document.querySelector(".clet-launchpad__see-more-btn"),
		).toBeInTheDocument();
	});

	it("opens the expanded Launchpad modal, showing every app uncapped, when the top-right expand button is clicked", async () => {
		const user = userEvent.setup();
		const apps: LaunchpadApp[] = Array.from({ length: 12 }, (_, i) => ({
			id: `app-${i}`,
			name: `App ${i}`,
			icon: <SystemLaunchpadIcon name={`App ${i}`} />,
		}));

		render(<Launchpad apps={apps}>{roleSelect()}</Launchpad>);

		await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

		// Two "See more" controls now exist: the top-right expand button and
		// the text under the grid. Use the top-right one (the expand button)
		// for this test.
		await user.click(
			document.querySelector(".clet-launchpad__see-more-btn") as HTMLElement,
		);

		expect(
			screen.getByRole("heading", { name: "Launchpad" }),
		).toBeInTheDocument();
		expect(
			document.querySelectorAll(
				".clet-launchpad__expand-grid .clet-launchpad__tile",
			),
		).toHaveLength(12);
	});

	it("does not render the See more text under the grid when apps fit within the cap", async () => {
		const user = userEvent.setup();

		render(<Launchpad apps={staticApps}>{roleSelect()}</Launchpad>);

		await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

		expect(
			document.querySelector(".clet-launchpad__see-more"),
		).not.toBeInTheDocument();
	});

	it("renders a muted See more text under the grid when there are more items to be seen", async () => {
		const user = userEvent.setup();
		const apps: LaunchpadApp[] = Array.from({ length: 12 }, (_, i) => ({
			id: `app-${i}`,
			name: `App ${i}`,
			icon: <SystemLaunchpadIcon name={`App ${i}`} />,
		}));

		render(<Launchpad apps={apps}>{roleSelect()}</Launchpad>);

		await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

		const seeMore = document.querySelector(".clet-launchpad__see-more");
		expect(seeMore).toBeInTheDocument();
		expect(seeMore).toHaveTextContent("See more");
	});

	it("places the See more text between the grid and the role switcher", async () => {
		const user = userEvent.setup();
		const apps: LaunchpadApp[] = Array.from({ length: 12 }, (_, i) => ({
			id: `app-${i}`,
			name: `App ${i}`,
			icon: <SystemLaunchpadIcon name={`App ${i}`} />,
		}));

		render(<Launchpad apps={apps}>{roleSelect()}</Launchpad>);

		await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

		const grid = document.querySelector(".clet-launchpad__grid");
		const seeMore = document.querySelector(".clet-launchpad__see-more");
		const footer = document.querySelector(".clet-launchpad__footer");
		expect(grid).not.toBeNull();
		expect(seeMore).not.toBeNull();
		expect(footer).not.toBeNull();
		// DOM order: grid → see-more → footer
		const gridPosition = Array.from(grid!.parentElement!.children).indexOf(grid!);
		const seeMorePosition = Array.from(seeMore!.parentElement!.children).indexOf(
			seeMore!,
		);
		const footerPosition = Array.from(footer!.parentElement!.children).indexOf(
			footer!,
		);
		expect(gridPosition).toBeLessThan(seeMorePosition);
		expect(seeMorePosition).toBeLessThan(footerPosition);
	});

	it("opens the expanded modal when the See more text under the grid is clicked", async () => {
		const user = userEvent.setup();
		const apps: LaunchpadApp[] = Array.from({ length: 12 }, (_, i) => ({
			id: `app-${i}`,
			name: `App ${i}`,
			icon: <SystemLaunchpadIcon name={`App ${i}`} />,
		}));

		render(<Launchpad apps={apps}>{roleSelect()}</Launchpad>);

		await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

		// The See more under the grid is a separate button from the top-right
		// expand button — they both open the same modal.
		const seeMoreUnderGrid = document.querySelector(
			".clet-launchpad__see-more",
		);
		expect(seeMoreUnderGrid).toBeInstanceOf(HTMLButtonElement);
		await user.click(seeMoreUnderGrid as HTMLButtonElement);

		expect(
			screen.getByRole("heading", { name: "Launchpad" }),
		).toBeInTheDocument();
		expect(
			document.querySelectorAll(
				".clet-launchpad__expand-grid .clet-launchpad__tile",
			),
		).toHaveLength(12);
	});

	it("selecting an app from the expanded modal calls onAppSelect and closes the modal", async () => {
		const user = userEvent.setup();
		const onAppSelect = vi.fn();

		render(
			<Launchpad apps={staticApps} onAppSelect={onAppSelect}>
				{roleSelect()}
			</Launchpad>,
		);

		await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

		// Two "See more" controls now exist; use the top-right expand button.
		await user.click(
			document.querySelector(".clet-launchpad__see-more-btn") as HTMLElement,
		);
		await user.click(screen.getByRole("link", { name: /Mail/i }));

		expect(onAppSelect).toHaveBeenCalledWith(
			expect.objectContaining({ id: "mail", name: "Mail" }),
		);
		expect(
			screen.queryByRole("heading", { name: "Launchpad" }),
		).not.toBeInTheDocument();
	});

	it("renders the role switcher below the grid via children", async () => {
		const user = userEvent.setup();

		render(
			<Launchpad apps={staticApps}>
				<RoleSelect
					title="View as"
					roles={[{ id: "admin", name: "Admin" }]}
					selectedRole="admin"
					onClickRole={() => {}}
				/>
			</Launchpad>,
		);

		await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

		expect(screen.getByText("View as")).toBeInTheDocument();
	});

	it("renders the role switcher and footer divider outside the scrollable/masked grid area", async () => {
		const user = userEvent.setup();

		render(<Launchpad apps={staticApps}>{roleSelect()}</Launchpad>);

		await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

		const gridScroll = document.querySelector(".clet-launchpad__grid-scroll");
		const footer = document.querySelector(".clet-launchpad__footer");
		expect(footer).not.toBeNull();
		expect(gridScroll?.contains(footer)).toBe(false);
		expect(footer?.textContent).toContain("View as");
	});
});
