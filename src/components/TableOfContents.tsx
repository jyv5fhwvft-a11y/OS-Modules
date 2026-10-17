import React from 'react';
import { CURRICULUM_LECTURES, LAB_02_DATA } from '../data/curriculum';

interface TableOfContentsProps {
  activeId: string;
  onSelectSection: (id: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  activeId,
  onSelectSection,
}) => {
  const sections = [
    ...CURRICULUM_LECTURES.map(l => ({
      id: l.id,
      chipLabel: `${l.title}`,
      desktopLabel: `${l.fullTitle.replace('Lecture ', 'Lecture ')}`,
      shortLabel: `L${l.number}: ${l.title.replace(`L${l.number}: `, '')}`,
    })),
    {
      id: LAB_02_DATA.id,
      chipLabel: 'Lab 02',
      desktopLabel: 'Lab 02: CPU Scheduling Simulators',
      shortLabel: 'Lab 02',
    },
  ];

  return (
    <nav className="toc-nav no-print" aria-label="Table of Contents">
      {/* Mobile TOC: Horizontal Chips + Dropdown */}
      <div className="lg:hidden bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-2.5 mb-4 shadow-sm">
        <div className="mb-2">
          <select
            value={activeId}
            onChange={e => onSelectSection(e.target.value)}
            className="w-full p-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-page)] text-[var(--text-primary)] text-xs font-medium cursor-pointer"
            aria-label="Jump to lecture"
          >
            <option value="" disabled>Jump to lecture ▾</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>
                {s.desktopLabel}
              </option>
            ))}
          </select>
        </div>

        <div className="flex overflow-x-auto gap-1.5 pb-1 no-scrollbar">
          {sections.map(s => {
            const isActive = activeId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSection(s.id)}
                className={`whitespace-nowrap px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors ${
                  isActive
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                    : 'bg-[var(--chip-bg)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
                }`}
              >
                {s.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-5 shadow-sm sticky top-5">
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 pb-2 border-b border-[var(--border-color)]">
          Module Navigation
        </div>
        <ul className="space-y-1">
          {sections.map(s => {
            const isActive = activeId === s.id;
            return (
              <li key={s.id}>
                <button
                  onClick={() => onSelectSection(s.id)}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-md transition-all border-l-2 ${
                    isActive
                      ? 'bg-[var(--code-bg)] text-[var(--accent-primary)] border-l-[var(--accent-primary)] font-bold shadow-xs'
                      : 'text-[var(--text-muted)] border-l-transparent hover:bg-[var(--code-bg)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {s.desktopLabel}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
