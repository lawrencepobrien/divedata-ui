/**
 * Pulls the round out of a DiveMeets event label, which carries the round as a
 * trailing parenthetical:
 *   "Men 3m Championship (6 Dives) - (Final)" → "Final"
 *   "Men 3m - (Prelim/Quarterfinal)"          → "Prelim/Quarterfinal"
 * Hand-logged dives have whatever the diver typed into "Round", with no
 * parenthetical, so those are used as-is.
 */
export function roundLabel(event: string | null | undefined): string {
  if (!event) return '';
  const match = event.match(/\s-\s\(([^)]+)\)\s*$/);
  return (match ? match[1] : event).trim();
}

/**
 * Chart/tooltip label for one event point. The round matters here because a
 * meet's prelim and final share a name and usually a date — without it the two
 * points are indistinguishable.
 */
export function eventPointLabel(competition: string, event: string | null | undefined): string {
  const round = roundLabel(event);
  return round ? `${competition} · ${round}` : competition;
}
