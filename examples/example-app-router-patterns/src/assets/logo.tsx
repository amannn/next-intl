// The next-intl globe mark, matching the logo used in the docs. Uses
// `currentColor` so the color can be controlled via the `text-*` utility.

export function Logo({className}: {className?: string}) {
  return (
    <svg
      aria-label="next-intl logo"
      className={className}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <g
        transform="translate(3.272 2.88)"
        stroke="currentColor"
        strokeWidth="5.4"
      >
        <path d="M96.19 98.498a53.922 53.922 0 0 1-3.958 3.418c-23.445 18.476-57.176 15.723-77.314-6.31-20.139-22.035-19.854-55.877.651-77.57C36.075-3.657 69.848-5.843 92.98 13.025c23.131 18.867 27.82 51.892 10.69 76.339" />
        <circle cx="95.561" cy="99.097" r="2.699" fill="currentColor" />
        <path
          d="M8.847 28.785c16.248-1.974 32.318-2.949 48.211-2.923 15.893.025 31.156 1.05 45.789 3.073"
          strokeLinecap="square"
        />
        <ellipse cx="57.421" cy="57.12" rx="28.035" ry="57.12" />
        <path
          d="M11.695 88.603c14.934 2 30.008 3 45.224 3 15.215 0 30.525-1 45.928-3M1.009 59.069h112.482"
          strokeLinecap="square"
        />
      </g>
    </svg>
  );
}
