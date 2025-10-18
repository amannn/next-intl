import clsx from "clsx";
import type React from "react";

export const PlaygroundBoundary = ({
	children,
	label,
	className,
}: {
	children: React.ReactNode;
	label?: string | string[];
	className?: string;
}) => {
	return (
		<div
			className={clsx(
				"relative border border-border text-muted-foreground p-4",
				className
			)}
		>
			{label && (
				<div className="absolute -top-2 left-4 flex gap-x-1 text-[9px]">
					{(typeof label === "string" ? [label] : label).map((text) => (
						<span
							key={text}
							className="px-1.5 font-mono font-medium tracking-widest uppercase bg-popover text-muted-foreground"
						>
							{text}
						</span>
					))}
				</div>
			)}

			{children}
		</div>
	);
};
