// Standard diving judging convention: sort judge scores, drop outliers down to a
// middle core of 3 — eliminated alternating highest, lowest, highest, lowest...
// (equivalently: split the drop evenly between the two ends, with the extra
// elimination on a tie going to the high side first). Officially the retained
// sum is then multiplied by the dive's degree of difficulty.
export function dropCounts(judgeCount: number): { dropLow: number; dropHigh: number } {
  const nDropped = Math.max(0, judgeCount - 3);
  return { dropLow: Math.floor(nDropped / 2), dropHigh: Math.ceil(nDropped / 2) };
}

// With fewer than 3 judges there's no outlier to drop, so the raw sum is scaled
// up to a 3-judge-equivalent instead: 1 judge -> x3, 2 judges -> x1.5 (3/2).
// 3+ judges use the real middle-3 sum, so no scaling is needed.
export function scoreMultiplier(judgeCount: number): number {
  return judgeCount > 0 && judgeCount < 3 ? 3 / judgeCount : 1;
}

export interface AnnotatedScore<T> {
  item: T;
  dropped: boolean;
  dropSide: 'high' | 'low' | null;
}

// Sorts by score ascending and marks which are dropped, and from which side,
// down to a middle core of 3. With fewer than 3 items nothing is dropped —
// see scoreMultiplier for how those are scored instead.
export function annotateJudgeScores<T>(
  items: T[],
  getScore: (item: T) => number,
): AnnotatedScore<T>[] {
  const sorted = [...items].sort((a, b) => getScore(a) - getScore(b));
  if (sorted.length < 3) {
    return sorted.map((item) => ({ item, dropped: false, dropSide: null }));
  }
  const { dropLow, dropHigh } = dropCounts(sorted.length);
  return sorted.map((item, i) => {
    const isLow = i < dropLow;
    const isHigh = i >= sorted.length - dropHigh;
    return { item, dropped: isLow || isHigh, dropSide: isLow ? 'low' : isHigh ? 'high' : null };
  });
}

export function sumRetainedJudgeScores(scores: number[]): number {
  if (scores.length === 0) return 0;
  const retainedSum = annotateJudgeScores(scores, (s) => s)
    .filter((a) => !a.dropped)
    .reduce((sum, a) => sum + a.item, 0);
  return retainedSum * scoreMultiplier(scores.length);
}
