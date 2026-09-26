interface KantongMarkProps {
  className?: string;
}

/** The Kantong logo mark: three rising bars on a marigold tile. Decorative. */
export function KantongMark({ className = "kantong-mark" }: KantongMarkProps) {
  return (
    <span className={className} aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="12" width="4" height="8" rx="1" fill="currentColor" opacity="0.55" />
        <rect x="9" y="7" width="4" height="13" rx="1" fill="currentColor" />
        <rect x="16" y="2" width="4" height="18" rx="1" fill="currentColor" opacity="0.7" />
      </svg>
    </span>
  );
}
