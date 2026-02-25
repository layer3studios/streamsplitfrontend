'use client';

/**
 * UserAvatar — Circle with initials and subtle hash-based tint.
 * No photo needed. Paper-friendly.
 */
export default function UserAvatar({ name = '', userId = '', size = 36, className = '' }) {
  const initials = (name || 'U').charAt(0).toUpperCase();

  // Derive subtle hue from userId string hash
  let hash = 0;
  const str = userId?.toString() || name;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = ((hash % 360) + 360) % 360;

  return (
    <div
      className={`shrink-0 flex items-center justify-center rounded-full border border-[var(--border)] ${className}`}
      style={{
        width: size,
        height: size,
        background: `hsl(${hue}, 40%, 90%)`,
      }}
    >
      <span
        className="font-heading font-bold leading-none"
        style={{
          fontSize: size * 0.4,
          color: `hsl(${hue}, 45%, 35%)`,
        }}
      >
        {initials}
      </span>
    </div>
  );
}
