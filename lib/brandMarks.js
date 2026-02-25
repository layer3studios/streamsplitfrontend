/**
 * Deterministic color generator from brand slugs.
 * Produces 2–3 harmonious HSL colors for SVG marks.
 */

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Returns { primary, secondary, accent } colors from a slug.
 * Saturation 45-65, lightness 35-55 (paper-friendly).
 * Dark theme: lightness bumped +15.
 */
export function colorsFromSlug(slug, isDark = false) {
  const h = hashStr(slug || 'default');
  const hue = h % 360;
  const sat = 45 + (h % 21);              // 45–65
  const lit = isDark ? 50 + (h % 16) : 35 + (h % 21); // dark: 50-65, light: 35-55
  const hue2 = (hue + 40 + (h % 30)) % 360;
  const hue3 = (hue + 180 + (h % 40)) % 360;

  return {
    primary: `hsl(${hue}, ${sat}%, ${lit}%)`,
    secondary: `hsl(${hue2}, ${sat - 10}%, ${lit + 10}%)`,
    accent: `hsl(${hue3}, ${sat - 15}%, ${lit + 15}%)`,
  };
}

/**
 * Returns a geometric mark type index (0-5) from a slug.
 */
export function markTypeFromSlug(slug) {
  return hashStr(slug || 'default') % 6;
}
