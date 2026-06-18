import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface AutocompleteInputProps {
	ariaLabel?: string;
	className?: string;
	options: string[];
	placeholder?: string;
	value: string;
	onChange: (value: string) => void;
	onSelect: (value: string) => void;
}

interface SuggestionListPosition {
	left: number;
	maxHeight: number;
	top: number;
	width: number;
}

export function AutocompleteInput({
	ariaLabel,
	className = "",
	options,
	placeholder = "Search",
	value,
	onChange,
	onSelect,
}: AutocompleteInputProps) {
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [suggestionListPosition, setSuggestionListPosition] = useState<SuggestionListPosition | null>(null);
	const rootRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const normalizedValue = value.trim().toLowerCase();
	const filteredOptions = normalizedValue
		? options.filter((option) => option.toLowerCase().includes(normalizedValue))
		: options;

	useEffect(() => {
		function closeOnOutsideClick(event: MouseEvent) {
			const target = event.target as Node;

			if (!rootRef.current?.contains(target) && !listRef.current?.contains(target)) {
				setOpen(false);
				inputRef.current?.blur();
			}
		}

		document.addEventListener("mousedown", closeOnOutsideClick);

		return () => {
			document.removeEventListener("mousedown", closeOnOutsideClick);
		};
	}, []);

	useEffect(() => {
		setActiveIndex(0);
	}, [value]);

	useEffect(() => {
		if (!open || !rootRef.current) {
			return;
		}

		function updateSuggestionListPosition() {
			const inputRect = rootRef.current?.getBoundingClientRect();

			if (!inputRect) {
				return;
			}

			const viewport = window.visualViewport;
			const viewportTop = viewport?.offsetTop ?? 0;
			const viewportHeight = viewport?.height ?? window.innerHeight;
			const viewportBottom = viewportTop + viewportHeight;
			const gap = 4;
			const availableBelow = viewportBottom - inputRect.bottom - gap;
			const availableAbove = inputRect.top - viewportTop - gap;
			const openAbove = availableBelow < 120 && availableAbove > availableBelow;
			const maxHeight = Math.max(96, Math.min(256, openAbove ? availableAbove : availableBelow));

			setSuggestionListPosition({
				left: inputRect.left,
				maxHeight,
				top: openAbove ? inputRect.top - maxHeight - gap : inputRect.bottom + gap,
				width: inputRect.width,
			});
		}

		updateSuggestionListPosition();
		window.addEventListener("resize", updateSuggestionListPosition);
		window.addEventListener("scroll", updateSuggestionListPosition, true);

		return () => {
			window.removeEventListener("resize", updateSuggestionListPosition);
			window.removeEventListener("scroll", updateSuggestionListPosition, true);
		};
	}, [open, value]);

	function selectOption(option: string): void {
		onSelect(option);
		setOpen(false);
		inputRef.current?.blur();
	}

	const suggestionList = open && filteredOptions.length > 0 && suggestionListPosition
		? createPortal(
			<div
				ref={listRef}
				className="fixed z-[60] overflow-auto rounded-lg border border-border bg-primary p-1 shadow-lg"
				style={{
					WebkitOverflowScrolling: "touch",
					left: suggestionListPosition.left,
					maxHeight: suggestionListPosition.maxHeight,
					top: suggestionListPosition.top,
					width: suggestionListPosition.width,
				}}
				onTouchMove={(event) => event.stopPropagation()}
			>
				{filteredOptions.map((option, index) => (
					<button
						key={option}
						type="button"
						className={[
							"block w-full rounded-none !bg-primary !p-2 text-left text-sm hover:!bg-secondary",
							index === activeIndex ? "!bg-secondary" : "",
						].filter(Boolean).join(" ")}
						onMouseDown={(event) => event.preventDefault()}
						onClick={() => selectOption(option)}
					>
						{option}
					</button>
				))}
			</div>,
			document.body,
		)
		: null;

	return (
		<div ref={rootRef} className="relative">
			<input
				ref={inputRef}
				aria-label={ariaLabel}
				aria-autocomplete="list"
				aria-expanded={open}
				className={className}
				placeholder={placeholder}
				type="text"
				value={value}
				onChange={(event) => {
					onChange(event.currentTarget.value);
					setOpen(true);
				}}
				onFocus={() => setOpen(true)}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						setOpen(false);
						inputRef.current?.blur();
						return;
					}

					if (!open || filteredOptions.length === 0) {
						return;
					}

					if (event.key === "ArrowDown") {
						event.preventDefault();
						setActiveIndex((index) => Math.min(index + 1, filteredOptions.length - 1));
					}

					if (event.key === "ArrowUp") {
						event.preventDefault();
						setActiveIndex((index) => Math.max(index - 1, 0));
					}

					if (event.key === "Enter") {
						event.preventDefault();

						const activeOption = filteredOptions[activeIndex];

						if (activeOption) {
							selectOption(activeOption);
						}
					}
				}}
			/>

			{suggestionList}
		</div>
	);
}
