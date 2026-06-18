import { setIcon } from "obsidian";
import { useEffect, useRef } from "react";

interface IconProps {
	name: string;
	className?: string;
}

export function Icon({ name, className = "" }: IconProps) {
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (!ref.current) {
			return;
		}

		ref.current.empty();
		setIcon(ref.current, name);
	}, [name]);

	return <span ref={ref} className={className} aria-hidden="true" />;
}
