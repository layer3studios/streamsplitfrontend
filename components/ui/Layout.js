export function Container({ children, className = '' }) {
  return (
    <div className={`max-w-[var(--page-max)] mx-auto px-[var(--page-px)] ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeader({ meta, title, subtitle, className = '', align = 'center' }) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';
  return (
    <div className={`${alignClass} ${className}`}>
      {meta && (
        <p className="text-meta mb-3">{meta}</p>
      )}
      <h2 className="text-display accent-dot">{title}</h2>
      {subtitle && (
        <p className="text-caption mt-3 max-w-lg mx-auto">{subtitle}</p>
      )}
    </div>
  );
}

export function Divider({ className = '' }) {
  return <hr className={`hairline ${className}`} />;
}
