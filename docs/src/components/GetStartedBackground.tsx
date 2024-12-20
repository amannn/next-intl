import styles from './GetStartedBackground.module.css';

export default function GetStartedBackground() {
  const size = 530;
  const radius = 2;
  const className =
    'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-screen';
  const patternSize = 19;

  return (
    <>
      <svg
        className={className}
        height={size}
        viewBox="0 0 500 500"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            height={patternSize}
            id="dots"
            patternUnits="userSpaceOnUse"
            width={patternSize}
          >
            <circle
              className={styles.dot}
              cx="3"
              cy="3"
              fill="var(--GetStartedBackground-dot)"
              r={radius}
            />
          </pattern>
          <radialGradient cx="50%" cy="50%" id="fade-out" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="fade-mask">
            <rect fill="url(#fade-out)" height="500" width="500" />
          </mask>
        </defs>
        <rect
          clipPath="url(#circle-clip)"
          fill="url(#dots)"
          height="500"
          mask="url(#fade-mask)"
          width="500"
        />
      </svg>
      <svg
        className={className}
        height={size}
        viewBox="0 0 500 500"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className={styles.dot1}
          cx="99"
          cy="155"
          fill="#7b42f6"
          r={radius}
        />
        <circle
          className={styles.dot2}
          cx="193"
          cy="193"
          fill="#0284c7"
          r={radius}
        />
        <circle
          className={styles.dot3}
          cx="307"
          cy="98"
          fill="#1E293C"
          r={radius}
        />
        <circle
          className={styles.dot4}
          cx="250"
          cy="345"
          fill="#5c9eff"
          r={radius}
        />
        <circle
          className={styles.dot5}
          cx="402"
          cy="250"
          fill="#7b42f6"
          r={radius}
        />
      </svg>
    </>
  );
}
