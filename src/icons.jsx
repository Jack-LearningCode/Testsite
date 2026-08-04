const common = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function ClipboardIcon() {
  return (
    <svg {...common}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  )
}

export function ClockIcon() {
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

export function BoltIcon() {
  return (
    <svg {...common}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  )
}

export function ChartIcon() {
  return (
    <svg {...common}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
      <path d="M2 20h20" />
    </svg>
  )
}

export function TargetIcon() {
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  )
}

export function MessageIcon() {
  return (
    <svg {...common}>
      <path d="M4 5h16v11H8l-4 4V5Z" />
    </svg>
  )
}

export function DownloadIcon() {
  return (
    <svg {...common}>
      <path d="M12 4v11m0 0 4-4m-4 4-4-4" />
      <path d="M4 18v2h16v-2" />
    </svg>
  )
}

export function ChatIcon() {
  return (
    <svg {...common}>
      <path d="M4 5h16v10H9l-3.5 3.5V15H4V5Z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  )
}

export function PuzzleIcon() {
  return (
    <svg {...common}>
      <path d="M9 4h4v2.2a1.8 1.8 0 1 0 2 0V4h4v4h-2.2a1.8 1.8 0 1 0 0 2H19v4h-4v-2.2a1.8 1.8 0 1 0-2 0V14H9v-4H6.8a1.8 1.8 0 1 0 0-2H9V4Z" />
    </svg>
  )
}
