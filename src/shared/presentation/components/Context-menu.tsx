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

export function ContextMenu({ trigger, items }: ContextMenuProps) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);

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

	return (
		<div ref={rootRef} className="relative">
			{triggerEl}

			{open && (
				<div
					role="menu"
					className= "absolute left-0 top-full mt-1 z-50 bg-primary shadow-lg border-border border border-solid rounded-lg overflow-hidden"
				>
					{items.map((item, index) => (
						<button
							key={item.key || createMenuItemKey(item.label, index)}
							type="button"
							role="menuitem"
							disabled={item.disabled}
							className="block rounded-none text-center text-sm hover:bg-secondary disabled:opacity-50 w-full"
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
