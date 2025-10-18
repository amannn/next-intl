import Link from "next/link";
import { PlaygroundBoundary } from "./_components/playground-boundary";
import { sections } from "./assets/navigations";
import { LinkStatus } from "./_components/link-status";

export default function Home() {
	return (
		<div>
			<div className="mb-12 text-center">
				<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
					Welcome to the next-intl Playground
				</h1>
				<p className="text-muted-foreground text-base sm:text-lg md:text-xl">
					Explore translations, formatting, routing, and patterns using Next.js
					and next-intl.
				</p>
			</div>
			<PlaygroundBoundary label="Examples" className="flex flex-col gap-8 sm:gap-9">
				{sections.map((section) => (
					<div key={section.title} className="flex flex-col gap-2 sm:gap-3">
						<div className="font-mono text-[10px] sm:text-xs font-semibold tracking-wider text-muted-foreground uppercase">
							{section.title}
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
							{section.items.map((item) => (
								<Link
									href={item.slug}
									key={item.title}
									className="group flex flex-col gap-1 rounded-lg bg-card px-4 sm:px-5 py-3 hover:bg-popover transition-colors"
								>
									<div className="flex items-center justify-between font-medium text-foreground group-hover:text-primary">
										{item.title} <LinkStatus />
									</div>

									{item.description && (
										<div className="line-clamp-3 text-sm sm:text-[13px] text-muted-foreground group-hover:text-foreground">
											{item.description}
										</div>
									)}
								</Link>
							))}
						</div>
					</div>
				))}
			</PlaygroundBoundary>
		</div>
	);
}
