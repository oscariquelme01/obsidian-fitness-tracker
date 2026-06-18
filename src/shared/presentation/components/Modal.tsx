import { useEffect, type ReactNode } from "react";

interface ModalProps {
	children: ReactNode;
	title: string;
	onClose: () => void;
}

export function Modal({ children, title, onClose }: ModalProps) {
	useEffect(() => {
		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape") {
				onClose();
			}
		}

		document.addEventListener("keydown", closeOnEscape);

		return () => {
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [onClose]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="fitness-tracker-modal-title"
				className="max-h-[85vh] w-full max-w-md overflow-auto rounded-lg border border-border bg-primary p-4 shadow-lg"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="mb-4 flex items-center justify-between gap-4">
					<h2 id="fitness-tracker-modal-title" className="m-0 text-lg font-semibold">
						{title}
					</h2>
					<button
						type="button"
						aria-label="Close modal"
						className="!border-0 !bg-transparent !shadow-none hover:!bg-transparent"
						onClick={onClose}
					>
						x
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}
