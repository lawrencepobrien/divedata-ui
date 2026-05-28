function Footer(): JSX.Element {
  return (
    <footer className="border-t border-slate-800 px-6 py-4 shrink-0">
      <p className="text-slate-600 text-xs text-center">
        © {new Date().getFullYear()} DiveData
      </p>
    </footer>
  );
}

export default Footer;
