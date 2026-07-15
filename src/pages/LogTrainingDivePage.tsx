import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BoardType } from '../types/trendline';
import { useCreateTrainingDive } from '../hooks/useDiver';
import { useDiveTypeLookup } from '../hooks/useDiveTypes';
import { annotateJudgeScores, scoreMultiplier, sumRetainedJudgeScores } from '../lib/diveScoring';

const BOARD_OPTIONS: BoardType[] = ['1m', '3m', '5m', '7.5m', '10m'];

// Waits for typing to pause before firing the dd lookup — avoids a request per keystroke.
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

interface Props {
  diverId: string;
}

export default function LogTrainingDivePage({ diverId }: Props) {
  const navigate = useNavigate();
  const createDive = useCreateTrainingDive(diverId);

  const [diveCode, setDiveCode] = useState('');
  const [board, setBoard] = useState<BoardType>('3m');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [totalScore, setTotalScore] = useState('');
  const [judgeScores, setJudgeScores] = useState<string[]>([]);

  const debouncedDiveCode = useDebouncedValue(diveCode, 300);
  const { data: diveType, isFetching: lookingUpDiveType } = useDiveTypeLookup(
    debouncedDiveCode.length >= 3 ? debouncedDiveCode : null,
    board,
  );
  const difficulty = diveType?.difficulty ?? null;

  const hasTotalScore = totalScore.trim() !== '';
  const validJudgeScores = judgeScores.filter((s) => s.trim() !== '').map(Number);
  const hasJudgeScores = validJudgeScores.length > 0;
  const judgeScoreSum = hasJudgeScores ? sumRetainedJudgeScores(validJudgeScores) : null;
  const computedTotal =
    !hasTotalScore && judgeScoreSum != null
      ? difficulty != null
        ? judgeScoreSum * difficulty
        : judgeScoreSum
      : null;

  const canSubmit =
    diveCode.trim().length > 0 && date.length > 0 && (hasTotalScore || hasJudgeScores);

  const handleDiveCodeChange = (raw: string) => {
    // Force caps, digits only plus letters A–E (matches FINA position codes) —
    // strips anything else (special characters, letters past E) as the user types.
    const sanitized = raw.toUpperCase().replace(/[^0-9A-E]/g, '');
    setDiveCode(sanitized);
  };

  const addJudge = () => setJudgeScores((prev) => [...prev, '']);
  const removeJudge = (i: number) => setJudgeScores((prev) => prev.filter((_, idx) => idx !== i));
  const updateJudge = (i: number, value: string) =>
    setJudgeScores((prev) => prev.map((s, idx) => (idx === i ? value : s)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    createDive.mutate(
      {
        dive_code: diveCode.trim().toUpperCase(),
        board,
        total_score: hasTotalScore ? Number(totalScore) : (computedTotal ?? 0),
        dived_at: new Date(date).toISOString(),
        judge_scores: validJudgeScores,
      },
      {
        onSuccess: () => navigate('/profile/me'),
      },
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm mb-8 transition-colors cursor-pointer"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-1">Log a Training Dive</h1>
      <p className="text-slate-400 text-sm mb-8">Record a dive from practice.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
          <Field label="Dive code">
            <input
              value={diveCode}
              onChange={(e) => handleDiveCodeChange(e.target.value)}
              placeholder="e.g. 5154B"
              className={`${inputClass} uppercase`}
            />
            <p className="text-slate-600 text-xs mt-1">
              FINA dive code — digits plus a position letter A–E (e.g. 101A, 5152B)
            </p>
            {debouncedDiveCode.length >= 3 && (
              <p className="text-xs mt-1">
                {lookingUpDiveType ? (
                  <span className="text-slate-600">Looking up degree of difficulty…</span>
                ) : difficulty != null ? (
                  <span className="text-slate-500">
                    Degree of difficulty on {board}: <span className="text-cyan-400 font-medium">{difficulty.toFixed(2)}</span>
                  </span>
                ) : (
                  <span className="text-slate-600">No degree of difficulty on file for this dive on {board} yet.</span>
                )}
              </p>
            )}
          </Field>

          <Field label="Board">
            <div className="flex gap-1.5 flex-wrap">
              {BOARD_OPTIONS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBoard(b)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                    board === b
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Total score">
            <input
              type="number"
              step="0.1"
              value={totalScore}
              onChange={(e) => setTotalScore(e.target.value)}
              disabled={hasJudgeScores}
              placeholder={hasJudgeScores ? 'Calculated from judge scores below' : 'e.g. 57.50'}
              className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            <p className="text-slate-600 text-xs mt-1">
              Enter a total score, or leave blank and add judge scores below instead.
            </p>
          </Field>

          <Field label="Judge scores">
            <div className="flex flex-col gap-2">
              {judgeScores.map((score, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={score}
                    onChange={(e) => updateJudge(i, e.target.value)}
                    disabled={hasTotalScore}
                    className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  <button
                    type="button"
                    onClick={() => removeJudge(i)}
                    className="text-slate-600 hover:text-rose-400 text-xs cursor-pointer transition-colors shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addJudge}
                disabled={hasTotalScore}
                className="self-start text-cyan-400 hover:text-cyan-300 text-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add judge score
              </button>
              {hasJudgeScores && (
                <div className="flex gap-2 flex-wrap mt-1">
                  {annotateJudgeScores(validJudgeScores, (s) => s).map(({ item: score, dropped, dropSide }, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold ${
                        dropped
                          ? 'border-slate-800 bg-slate-950 text-slate-600'
                          : 'border-slate-700 bg-slate-800 text-slate-100'
                      }`}
                    >
                      <span>{score.toFixed(1)}</span>
                      {dropped && (
                        <span className="text-[10px] font-sans text-slate-700 font-normal">
                          dropped ({dropSide})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {computedTotal != null && (
                <p className="text-slate-500 text-xs mt-1">
                  Calculated total: <span className="text-cyan-400 font-medium">{computedTotal.toFixed(2)}</span>
                  {' '}
                  {validJudgeScores.length < 3
                    ? `(${validJudgeScores.length} judge${validJudgeScores.length === 1 ? '' : 's'} scaled ×${scoreMultiplier(validJudgeScores.length).toFixed(2)}`
                    : '(middle scores summed'}
                  {difficulty != null ? ` × ${difficulty.toFixed(2)} DD)` : ' — no degree of difficulty on file for this dive/board)'}
                </p>
              )}
            </div>
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || createDive.isPending}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed
                       text-slate-950 font-semibold rounded-lg px-5 py-2.5 text-sm transition duration-150 cursor-pointer"
          >
            {createDive.isPending ? 'Saving…' : 'Log dive'}
          </button>
          {!canSubmit && diveCode.trim().length > 0 && !hasTotalScore && !hasJudgeScores && (
            <span className="text-sm text-slate-500">
              Enter a total score or at least one judge score.
            </span>
          )}
          {createDive.isError && (
            <span className="text-sm text-red-400">
              {createDive.error instanceof Error ? createDive.error.message : 'Failed to save dive'}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

const inputClass =
  'bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-2.5 text-sm w-full ' +
  'placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150';

function Field({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
