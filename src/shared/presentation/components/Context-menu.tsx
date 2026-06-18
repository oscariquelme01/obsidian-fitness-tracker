import { useEffect, useRef, useState, type ReactNode } from "react";

export interface ContextMenuItem {
	label: ReactNode;
	onSelect: () => void;
	key?: string
	disabled?: boolean;
}

interface ContextMenuProps {
	trigger: ReactNode;
	items: ContextMenuItem[];
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

	return (
		<div ref={rootRef} className="relative inline-block rounded-none">
			<button className="rounded-none" type="button" onClick={() => setOpen((value) => !value)}>
				{trigger}
			</button>

			{open && (
				<div
					role="menu"
					className= "absolute bottom-4 z-50 bg-primary shadow-lg flex flex-col items-start"
				>
					{items.map((item, index) => (
						<button
							key={item.key || createMenuItemKey(item.label, index)}
							type="button"
							role="menuitem"
							disabled={item.disabled}
							className="block rounded-none text-left text-sm hover:bg-secondary disabled:opacity-50"
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
