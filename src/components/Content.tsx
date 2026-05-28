import { Link, useLocation } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

function Content({ children }: Props): JSX.Element {
  const location = useLocation();

  const navItems = [
    { label: 'Profile', to: '/profile' },
  ];

  return (
    <div className="flex flex-1 overflow-hidden">

      <aside className="w-56 border-r border-slate-800 px-3 py-6 shrink-0">
        <ul className="flex flex-col gap-1">
          {navItems.map(({ label, to }) => (
            <li key={to}>
              <Link
                to={to}
                className={`block px-3 py-2 rounded-lg text-sm transition duration-150 ${
                  location.pathname === to
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 px-8 py-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}

export default Content;
