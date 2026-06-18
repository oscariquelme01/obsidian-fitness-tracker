import {
	cloneElement,
	useEffect,
	useRef,
	useState,
	type KeyboardEvent as ReactKeyboardEvent,
	type MouseEvent as ReactMouseEvent,
	type ReactElement,
	type ReactNode,
} from "react";

export interface ContextMenuItem {
	label: ReactNode;
	onSelect: () => void;
	key?: string;
	disabled?: boolean;
}

interface ContextMenuProps {
	trigger: ReactElement<TriggerProps>;
	items: ContextMenuItem[];
}

interface TriggerProps {
	onClick?: (event: ReactMouseEvent) => void;
	onKeyDown?: (event: ReactKeyboardEvent) => void;
	role?: string;
	tabIndex?: number;
	"aria-expanded"?: boolean;
	"aria-haspopup"?: "menu";
}

type MenuPlacement = {
	horizontal: "left" | "right";
	vertical: "bottom" | "top";
};

export function ContextMenu({ trigger, items }: ContextMenuProps) {
	const [open, setOpen] = useState(false);
	const [placement, setPlacement] = useState<MenuPlacement>({ horizontal: "left", vertical: "bottom" });
	const rootRef = useRef<HTMLDivElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;

		function closeOnOutsideClick(event: MouseEvent) {
			if (!rootRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		}

		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setOpen(false);
			}
		}

		document.addEventListener("mousedown", closeOnOutsideClick);
		document.addEventListener("keydown", closeOnEscape);

		return () => {
			document.removeEventListener("mousedown", closeOnOutsideClick);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [open]);

	useEffect(() => {
		if (!open || !rootRef.current || !menuRef.current) {
			return;
		}

		const triggerRect = rootRef.current.getBoundingClientRect();
		const menuRect = menuRef.current.getBoundingClientRect();
		const viewportGap = 8;
		const nextPlacement: MenuPlacement = {
			horizontal: triggerRect.left + menuRect.width + viewportGap > window.innerWidth ? "right" : "left",
			vertical: triggerRect.bottom + menuRect.height + viewportGap > window.innerHeight ? "top" : "bottom",
		};

		setPlacement(nextPlacement);
	}, [open, items]);

	const triggerEl = cloneElement(trigger, {
		"aria-expanded": open,
		"aria-haspopup": "menu",
		onClick: (event: ReactMouseEvent) => {
			trigger.props.onClick?.(event);
			setOpen((value) => !value);
		},
		onKeyDown: (event: ReactKeyboardEvent) => {
			trigger.props.onKeyDown?.(event);

			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				setOpen((value) => !value);
			}
		},
		role: trigger.props.role ?? "button",
		tabIndex: trigger.props.tabIndex ?? 0,
	});

	const placementClass = [
		placement.horizontal === "left" ? "left-0" : "right-0",
		placement.vertical === "bottom" ? "top-full mt-1" : "bottom-full mb-1",
	].join(" ");

	return (
		<div ref={rootRef} className="relative">
			{triggerEl}

			{open && (
				<div
					ref={menuRef}
					role="menu"
					className={`${placementClass} absolute z-50 max-h-[min(20rem,calc(100vh-1rem))] max-w-[calc(100vw-1rem)] overflow-auto rounded-lg border border-border border-solid bg-primary p-1 shadow-lg`}
				>
					{items.map((item, index) => (
						<button
							key={item.key || createMenuItemKey(item.label, index)}
							type="button"
							role="menuitem"
							disabled={item.disabled}
							className="block rounded-none !bg-primary text-sm hover:bg-secondary !h-auto disabled:opacity-50 !p-2 text-center w-full"
							onClick={() => {
								item.onSelect();
								setOpen(false);
							}}
						>
							{item.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function createMenuItemKey(label: ReactNode, index: number): string {
	return typeof label === "string" || typeof label === "number"
		? String(label)
		: String(index);
}
