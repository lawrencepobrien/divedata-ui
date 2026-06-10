import { ReactNode } from 'react';

interface SidebarLayoutProps {
  /** One Sidebar, or a fragment of several, docked on the left. */
  left?: ReactNode;
  /** One Sidebar, or a fragment of several, docked on the right. */
  right?: ReactNode;
  className?: string;
  /** Main content; fills the space between the sidebars and scrolls independently. */
  children: ReactNode;
}

/**
 * Flex shell that arranges [left sidebars][main][right sidebars] on one row.
 * Fills its parent's height (`h-full`), so place it inside a sized container.
 * Multiple panels per side = multiple children in the corresponding slot.
 */
function SidebarLayout({ left, right, className = '', children }: SidebarLayoutProps): JSX.Element {
  return (
    <div className={`flex h-full overflow-hidden ${className}`}>
      {left}
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
      {right}
    </div>
  );
}

export default SidebarLayout;
