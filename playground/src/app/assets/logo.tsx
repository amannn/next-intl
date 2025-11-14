
export function Logo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 115 120"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <g className="block dark:hidden" stroke="#008FD6" strokeWidth="5.4">
        <path
          d="M96.19,98.5 C94.93,99.7 93.61,100.84 92.23,101.92
             C68.79,120.39 35.06,117.64 14.92,95.61
             C-5.22,73.57 -4.94,39.73 15.57,18.04
             C36.07,-3.66 69.85,-5.84 92.98,13.02
             C116.11,31.89 120.8,64.92 103.67,89.36"
        />
        <circle cx="95.56" cy="99.1" r="2.7" fill="#008FD6" />
        <path
          d="M8.85,28.78 C25.09,26.81 41.16,25.84 57.06,25.86
             C72.95,25.89 88.21,26.91 102.85,28.93"
          strokeLinecap="square"
        />
        <ellipse cx="57.42" cy="57.12" rx="28.04" ry="57.12" />
        <path
          d="M11.7,88.6 C26.63,90.6 41.7,91.6 56.92,91.6
             C72.13,91.6 87.44,90.6 102.85,88.6"
          strokeLinecap="square"
        />
        <line
          x1="1.01"
          y1="59.07"
          x2="113.49"
          y2="59.07"
          strokeLinecap="square"
        />
      </g>

      {/* Dark mode version */}
      <g className="hidden dark:block" stroke="#70D2FF" strokeWidth="5.4">
        <path
          d="M96.17,98.5 C94.91,99.7 93.59,100.84 92.21,101.92
             C68.77,120.39 35.05,117.64 14.91,95.61
             C-5.22,73.57 -4.94,39.73 15.57,18.04
             C36.07,-3.66 69.83,-5.84 92.96,13.02
             C116.08,31.89 120.77,64.92 103.64,89.36"
        />
        <circle cx="95.54" cy="99.1" r="2.7" fill="#70D2FF" />
        <path
          d="M8.84,28.78 C25.09,26.81 41.16,25.84 57.04,25.86
             C72.93,25.89 88.19,26.91 102.82,28.93"
          strokeLinecap="square"
        />
        <ellipse cx="57.41" cy="57.12" rx="28.03" ry="57.12" />
        <path
          d="M11.69,88.6 C26.62,90.6 41.69,91.6 56.91,91.6
             C72.12,91.6 87.42,90.6 102.82,88.6"
          strokeLinecap="square"
        />
        <line
          x1="1.01"
          y1="59.07"
          x2="113.46"
          y2="59.07"
          strokeLinecap="square"
        />
      </g>
    </svg>
  );
}
