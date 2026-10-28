const PATHS = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  heart: <path d="M12 19.5s-7.5-4.4-7.5-9.8A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.3c0 5.4-7.5 9.8-7.5 9.8z" />,
  bag: <><path d="M5.5 8.5h13l-1.1 11.5H6.6z" /><path d="M9 10V7a3 3 0 0 1 6 0v3" /></>,
  box: <><path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5z" /><path d="m4 7.5 8 3.5 8-3.5M12 11v9" /></>,
  truck: <><path d="M3 6.5h11v9.5H3zM14 9.5h4l3 3.2V16h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>,
  return: <><path d="M9 6 5 10l4 4" /><path d="M5 10h9.5a4.5 4.5 0 0 1 0 9H11" /></>,
  card: <><rect x="3" y="6" width="18" height="12.5" rx="2" /><path d="M3 10h18M7 15h3" /></>,
  gift: <><path d="M4.5 10h15v10h-15zM3.5 7h17v3h-17zM12 7v13" /><path d="M12 7c-1.5-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-3.5-2-5 1" /></>,
  leaf: <><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z" /><path d="M5 19c3-4 6-7 10-9" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  right: <path d="m9 5 7 7-7 7" />,
  left: <path d="m15 5-7 7 7 7" />,
  down: <path d="m5 9 7 7 7-7" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrow: <path d="M4 12h16M14 6l6 6-6 6" />,
  filter: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  phone: <path d="M6.5 4h3l1.5 4-2 1.3a10 10 0 0 0 5.7 5.7L16 13l4 1.5v3A2.5 2.5 0 0 1 17.5 20 14.5 14.5 0 0 1 4 6.5 2.5 2.5 0 0 1 6.5 4z" />,
  pin: <><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>,
  tag: <><path d="M3.5 12.5V4.5h8l9 9-8 8z" /><circle cx="8" cy="9" r="1.4" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  trash: <path d="M5 7h14M10 7V5h4v2M7 7l1 12.5h8L17 7" />,
  expand: <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />,
}

export default function Icon({ name, size = 22, stroke = 1.5, className, fill = 'none' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}

// Знак «Полдня»: солнце в зените, круг и восемь лучей
export function SunMark({ size = 34, color = '#D2442A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true" focusable="false">
      <circle cx="17" cy="17" r="8" fill={color} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <rect key={a} x="16" y="1" width="2" height="6" rx="1" fill={color} transform={`rotate(${a} 17 17)`} />
      ))}
    </svg>
  )
}
