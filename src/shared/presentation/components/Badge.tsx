import type { ReactNode } from "react";

type BadgeFlavour = "danger" | "info" | "secondary" | "success" | "warning";

interface BadgeProps {
	children: ReactNode;
	flavour: BadgeFlavour;
	className?: string;
}

const BADGE_FLAVOUR_CLASSES: Record<BadgeFlavour, string> = {
	danger: "border-ctp-red/40 bg-ctp-red/15 text-ctp-red",
	info: "border-ctp-blue/40 bg-ctp-blue/15 text-ctp-blue",
	secondary: "border-ctp-overlay0/40 bg-transparent text-ctp-subtext0",
	success: "border-ctp-green/40 bg-ctp-green/15 text-ctp-green",
	warning: "border-ctp-yellow/40 bg-ctp-yellow/15 text-ctp-yellow",
};

export function Badge({ children, flavour, className = "" }: BadgeProps) {
	return (
		<span
			className={[
				"inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium leading-none",
				BADGE_FLAVOUR_CLASSES[flavour],
				className,
			].filter(Boolean).join(" ")}
		>
			{children}
		</span>
	);
}
