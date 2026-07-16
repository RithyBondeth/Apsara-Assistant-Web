"use client";

import { useId } from "react";

/**
 * Real platform marks. lucide-react 1.x removed brand icons for trademark
 * reasons, and the generic stand-ins (a paper plane for Telegram, a camera for
 * Instagram) read as placeholders. These are the official glyphs, self-coloured
 * in each brand's palette, so they don't inherit `currentColor`.
 *
 * Paths are the CC0 marks from simple-icons; the trademarks remain the property
 * of their owners and are used here only to identify the service being linked.
 */

export interface IBrandIconProps {
  className?: string;
}

export function TelegramIcon({ className }: IBrandIconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" role="img" aria-hidden className={className}>
      <defs>
        <linearGradient id={`tg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2AABEE" />
          <stop offset="1" stopColor="#229ED9" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill={`url(#tg-${id})`} />
      <path
        fill="#fff"
        d="M5.491 11.74c3.5-1.525 5.833-2.53 7-3.016 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14a.506.506 0 0 1 .17.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.5 1.201-.82 1.23-.697.065-1.226-.46-1.901-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.07-.062-.174-.041-.249-.024-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663z"
      />
    </svg>
  );
}

export function MessengerIcon({ className }: IBrandIconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" role="img" aria-hidden className={className}>
      <defs>
        <linearGradient id={`ms-${id}`} x1="0.2" y1="0.95" x2="0.8" y2="0.05">
          <stop offset="0" stopColor="#0099FF" />
          <stop offset="0.6" stopColor="#A033FF" />
          <stop offset="0.9" stopColor="#FF5280" />
          <stop offset="1" stopColor="#FF7061" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#ms-${id})`}
        d="M12 0C5.24 0 0 4.95 0 11.64c0 3.5 1.43 6.52 3.76 8.61.2.17.31.42.32.68l.07 2.14a.96.96 0 0 0 1.35.85l2.39-1.05c.2-.09.42-.1.63-.05 1.1.3 2.26.46 3.48.46 6.76 0 12-4.95 12-11.64C24 4.95 18.76 0 12 0z"
      />
      <path
        fill="#fff"
        d="M4.8 15.05l3.52-5.6a1.8 1.8 0 0 1 2.61-.48l2.8 2.1c.26.2.6.2.86 0l3.79-2.87c.5-.38 1.17.22.82.75l-3.52 5.6a1.8 1.8 0 0 1-2.6.48l-2.8-2.1a.72.72 0 0 0-.87 0l-3.79 2.87c-.5.39-1.17-.22-.82-.75z"
      />
    </svg>
  );
}

export function InstagramIcon({ className }: IBrandIconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" role="img" aria-hidden className={className}>
      <defs>
        <radialGradient id={`ig-${id}`} cx="0.3" cy="1.05" r="1.3">
          <stop offset="0" stopColor="#FDF497" />
          <stop offset="0.15" stopColor="#FDF497" />
          <stop offset="0.45" stopColor="#FD5949" />
          <stop offset="0.6" stopColor="#D6249F" />
          <stop offset="0.9" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill={`url(#ig-${id})`} />
      <path
        fill="#fff"
        d="M12 6.87A5.13 5.13 0 1 0 12 17.13 5.13 5.13 0 0 0 12 6.87zm0 8.46A3.33 3.33 0 1 1 12 8.67a3.33 3.33 0 0 1 0 6.66z"
      />
      <circle cx="17.34" cy="6.66" r="1.2" fill="#fff" />
      <path
        fill="#fff"
        d="M12 4.62c2.4 0 2.69.01 3.64.05.88.04 1.35.19 1.67.31.42.16.72.36 1.04.67.31.32.51.62.67 1.04.12.32.27.79.31 1.67.04.95.05 1.24.05 3.64s-.01 2.69-.05 3.64c-.4.88-.19 1.35-.31 1.67-.16.42-.36.72-.67 1.04-.32.31-.62.51-1.04.67-.32.12-.79.27-1.67.31-.95.04-1.24.05-3.64.05s-2.69-.01-3.64-.05c-.88-.04-1.35-.19-1.67-.31a2.8 2.8 0 0 1-1.04-.67 2.8 2.8 0 0 1-.67-1.04c-.12-.32-.27-.79-.31-1.67-.04-.95-.05-1.24-.05-3.64s.01-2.69.05-3.64c.04-.88.19-1.35.31-1.67.16-.42.36-.72.67-1.04.32-.31.62-.51 1.04-.67.32-.12.79-.27 1.67-.31.95-.04 1.24-.05 3.64-.05m0-1.62c-2.44 0-2.75.01-3.71.05-.96.05-1.61.2-2.19.42-.6.23-1.1.54-1.61 1.04-.5.51-.81 1.01-1.04 1.61-.22.58-.37 1.23-.42 2.19-.04.96-.05 1.27-.05 3.71s.01 2.75.05 3.71c.5.96.2 1.61.42 2.19.23.6.54 1.1 1.04 1.61.51.5 1.01.81 1.61 1.04.58.22 1.23.37 2.19.42.96.04 1.27.05 3.71.05s2.75-.01 3.71-.05c.96-.05 1.61-.2 2.19-.42.6-.23 1.1-.54 1.61-1.04.5-.51.81-1.01 1.04-1.61.22-.58.37-1.23.42-2.19.04-.96.05-1.27.05-3.71s-.01-2.75-.05-3.71c-.05-.96-.2-1.61-.42-2.19a4.4 4.4 0 0 0-1.04-1.61 4.4 4.4 0 0 0-1.61-1.04c-.58-.22-1.23-.37-2.19-.42C14.75 3.01 14.44 3 12 3z"
      />
    </svg>
  );
}

export function WebsiteIcon({ className }: IBrandIconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" role="img" aria-hidden className={className}>
      <defs>
        <linearGradient id={`wb-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill={`url(#wb-${id})`} />
      <g
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="6" />
        <path d="M6 12h12M12 6c1.6 1.9 2.4 3.9 2.4 6s-.8 4.1-2.4 6c-1.6-1.9-2.4-3.9-2.4-6s.8-4.1 2.4-6z" />
      </g>
    </svg>
  );
}
