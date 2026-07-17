/**
 * Fill `{placeholder}` slots in a translated string.
 *
 * Word order differs between English and Khmer, so counts and names have to
 * travel as named slots inside the translation rather than be concatenated
 * around it. An unmatched slot is left visible instead of silently blanking,
 * so a missing variable shows up during review.
 */
export function fmt(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match
  );
}
