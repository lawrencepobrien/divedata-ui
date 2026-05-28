interface Props {
  onSignOut: () => void;
}

function Header({ onSignOut }: Props): JSX.Element {
  return (
    <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
      <span className="text-lg font-bold">
        Dive<span className="text-cyan-400">Data</span>
      </span>
      <button
        onClick={onSignOut}
        className="text-slate-500 hover:text-slate-300 text-sm transition duration-150 cursor-pointer"
      >
        Sign out
      </button>
    </header>
  );
}

export default Header;
