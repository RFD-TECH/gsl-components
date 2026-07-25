import { useCallback, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Maximize2 } from "lucide-react";
import { useLaunchpad } from "./hooks/useLaunchpad";
import { Button } from "../button/Button";
import {
	Modal,
	ModalPortal,
	ModalOverlay,
	ModalContent,
	ModalTitle,
} from "../modal/Modal";
import { LaunchpadGridIcon } from "./LaunchpadGridIcon";
import { LaunchpadItem } from "./LaunchpadItem";
import type { LaunchpadApp, LaunchpadProps } from "../../types/launchpad";
import { cn } from "../../utils/cn";
import adinkraSymbolStrip from "./assets/adinkra-symbol.png";
import "./styles/launchpad.css";

/**
 * Max apps shown in the popover grid — fixed, not configurable. When
 * `apps.length` exceeds this cap, the extras are not rendered (the grid
 * shows the first `MAX_APPS`) and a muted "See more" line appears under
 * the grid, above the role switcher. Clicking the line — or the top-right
 * expand button — opens a scaled-up modal showing every app in `apps`.
 */
const MAX_APPS = 9;

/** Fixed brand copy — not configurable, so every Launchpad reads identically. */
const TITLE = "Launchpad";
const EXPAND_TITLE = "Launchpad";
const TRIGGER_LABEL = "Open Launchpad";
const SEE_MORE_LABEL = "See more";

export function Launchpad({
	apps,
	loading = false,
	open: controlledOpen,
	onOpenChange,
	onAppSelect,
	children,
	trigger,
	className,
	style,
	showBrandStrip = true,
}: LaunchpadProps) {
	const { open, setOpen, close } = useLaunchpad({
		open: controlledOpen,
		onOpenChange,
	});
	// The shared `Tooltip` component is itself built on @radix-ui/react-popover,
	// so wrapping it around this Popover.Trigger would make the trigger's
	// usePopoverContext() resolve to the tooltip's own Popover.Root instead of
	// ours — clicking would toggle the tooltip, never open the panel. Hence a
	// plain, Radix-free hover bubble here instead.
	const [tooltipOpen, setTooltipOpen] = useState(false);
	const [expandOpen, setExpandOpen] = useState(false);

	const handleSeeAll = useCallback(() => {
		close();
		setExpandOpen(true);
	}, [close]);

	const handleAppSelect = useCallback(
		(app: LaunchpadApp) => {
			app.onClick?.(app);
			onAppSelect?.(app);

			if (app.href) {
				window.open(app.href, app.href.startsWith("http") ? "_blank" : "_self");
			}

			setExpandOpen(false);
			close();
		},
		[onAppSelect, close],
	);

	const visibleApps = apps.slice(0, MAX_APPS);
	const hasMore = apps.length > MAX_APPS;

	return (
		<>
			<Popover.Root open={open} onOpenChange={setOpen}>
				<div className={cn("clet-launchpad gsl-launchpad", className)} style={style}>
					<div
						className="clet-launchpad__trigger-wrap gsl-launchpad__trigger-wrap"
						onMouseEnter={() => setTooltipOpen(true)}
						onMouseLeave={() => setTooltipOpen(false)}
						onFocus={() => setTooltipOpen(true)}
						onBlur={() => setTooltipOpen(false)}
					>
						<Popover.Trigger asChild>
							<button
								type="button"
								className="clet-launchpad__trigger gsl-launchpad__trigger"
								aria-label={TRIGGER_LABEL}
							>
								{trigger ?? <LaunchpadGridIcon />}
							</button>
						</Popover.Trigger>
						{tooltipOpen && (
							<div className="clet-launchpad__trigger-tooltip gsl-launchpad__trigger-tooltip" role="tooltip">
								{TRIGGER_LABEL}
							</div>
						)}
					</div>

					<Popover.Portal>
						<Popover.Content
							className="clet-launchpad__panel gsl-launchpad__panel"
							side="bottom"
							align="end"
							sideOffset={8}
							aria-label={TITLE}
						>
							<div className="clet-launchpad__header gsl-launchpad__header">
								<div className="clet-launchpad__title gsl-launchpad__title">{TITLE}</div>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="clet-launchpad__see-more-btn gsl-launchpad__see-more-btn"
									onClick={handleSeeAll}
									aria-label={SEE_MORE_LABEL}
								>
									<Maximize2 size={14} strokeWidth={2} aria-hidden />
								</Button>
							</div>

							{!loading && apps.length === 0 ? (
								<div className="clet-launchpad__status gsl-launchpad__status">
									No systems available.
								</div>
							) : null}

							<div className="clet-launchpad__grid-scroll gsl-launchpad__grid-scroll">
								{loading ? (
									<div
										className="clet-launchpad__grid gsl-launchpad__grid"
										aria-busy="true"
										aria-label="Loading"
									>
										{Array.from({ length: MAX_APPS }).map((_, index) => (
											<div className="clet-launchpad__skeleton-item gsl-launchpad__skeleton-item" key={index}>
												<div className="clet-launchpad__skeleton-icon gsl-launchpad__skeleton-icon" />
												<div className="clet-launchpad__skeleton-name gsl-launchpad__skeleton-name" />
											</div>
										))}
									</div>
								) : null}

								{!loading && visibleApps.length > 0 ? (
									<div className="clet-launchpad__grid gsl-launchpad__grid">
										{visibleApps.map((app) => (
											<LaunchpadItem
												key={app.id}
												app={app}
												onSelect={handleAppSelect}
											/>
										))}
									</div>
								) : null}
							</div>

							{!loading && hasMore ? (
								<button
									type="button"
									className="clet-launchpad__see-more gsl-launchpad__see-more"
									onClick={handleSeeAll}
									aria-label={SEE_MORE_LABEL}
								>
									{SEE_MORE_LABEL}
								</button>
							) : null}

							<div className="clet-launchpad__footer gsl-launchpad__footer">{children}</div>
						</Popover.Content>
					</Popover.Portal>
				</div>
			</Popover.Root>

			<Modal open={expandOpen} onOpenChange={setExpandOpen}>
				<ModalPortal>
					<ModalOverlay />
					<ModalContent
						size="2xl"
						showCloseButton
						className="clet-launchpad__expand gsl-launchpad__expand"
						aria-describedby={undefined}
					>
						<ModalTitle className="clet-launchpad__expand-title gsl-launchpad__expand-title">
							{EXPAND_TITLE}
						</ModalTitle>
						<div className="clet-launchpad__expand-scroll gsl-launchpad__expand-scroll">
							<div className="clet-launchpad__grid gsl-launchpad__grid clet-launchpad__expand-grid gsl-launchpad__expand-grid">
								{apps.map((app) => (
									<LaunchpadItem
										key={app.id}
										app={app}
										onSelect={handleAppSelect}
									/>
								))}
							</div>
						</div>
						{showBrandStrip ? (
							<img
								src={adinkraSymbolStrip}
								alt=""
								className="clet-launchpad__expand-base gsl-launchpad__expand-base"
							/>
						) : null}
					</ModalContent>
				</ModalPortal>
			</Modal>
		</>
	);
}
