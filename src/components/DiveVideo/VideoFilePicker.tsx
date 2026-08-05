import { useRef } from 'react';

interface Props {
  onSelect: (file: File) => void;
  disabled?: boolean;
  label?: string;
}

/** A styled button that opens the file dialog and hands back the chosen video file. */
export default function VideoFilePicker({ onSelect, disabled, label = 'Choose video' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = ''; // reset so picking the same file again still fires onChange
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 self-start bg-slate-800 hover:bg-slate-700
                   disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 rounded-lg
                   px-4 py-2 text-sm cursor-pointer transition duration-150"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        {label}
      </button>
    </>
  );
}
