import { ChangeEvent } from 'react';

interface TextInputProps {
  label: string;
  type?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

function TextInput({ label, type = 'text', onChange }: TextInputProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        onChange={onChange}
        className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-2.5 text-sm
                   placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                   transition duration-150"
      />
    </div>
  );
}

export default TextInput;
