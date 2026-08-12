import { useNavigate } from 'react-router-dom';

export interface Crumb {
  label: string;
  href?: string; // omit for the current page
}

interface Props {
  items: Crumb[];
}

function Breadcrumbs({ items }: Props): JSX.Element {
  const navigate = useNavigate();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-slate-700">/</span>}
            {item.href && !isLast ? (
              <button
                onClick={() => navigate(item.href!)}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ) : (
              <span className={isLast ? 'text-slate-200' : 'text-slate-400'}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
