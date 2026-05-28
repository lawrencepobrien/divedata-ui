import Header from './Header';
import Content from './Content';
import Footer from './Footer';

interface Props {
  onSignOut: () => void;
  children: React.ReactNode;
}

function Layout({ onSignOut, children }: Props): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header onSignOut={onSignOut} />
      <Content>{children}</Content>
      <Footer />
    </div>
  );
}

export default Layout;
