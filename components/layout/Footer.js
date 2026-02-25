import Link from 'next/link';
const BRAND = require('../../lib/brand');

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-12 mt-[var(--section-gap)]">
      <div className="max-w-[var(--page-max)] mx-auto px-[var(--page-px)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg text-[var(--text)]">{BRAND.name}</span>
          <p className="text-meta">
            &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
