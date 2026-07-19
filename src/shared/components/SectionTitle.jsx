export const SectionTitle = ({ children, sub }) => (
  <div className="mb-3">
    <h3 className="text-[15px] font-bold text-stone-900 tracking-tight">{children}</h3>
    {sub && <p className="text-xs text-stone-500 mt-0.5">{sub}</p>}
  </div>
);
