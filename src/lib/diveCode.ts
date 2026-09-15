// FINA dive codes lead with a digit that identifies the direction group —
// this is a fixed convention, not something the catalog curates per-dive.
const DIRECTION_BY_LEAD_DIGIT: Record<string, string> = {
  '1': 'Forward',
  '2': 'Back',
  '3': 'Reverse',
  '4': 'Inward',
  '5': 'Twisting',
  '6': 'Armstand',
};

export const DIVE_DIRECTIONS = Object.values(DIRECTION_BY_LEAD_DIGIT);

export function getDiveDirection(diveCode: string): string | null {
  return DIRECTION_BY_LEAD_DIGIT[diveCode.trim()[0]] ?? null;
}
