import React from 'react';
import { Sun, Moon, BookOpen, Layers, Printer, Search } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeView: 'curriculum' | 'simulators';
  onViewChange: (view: 'curriculum' | 'simulators') => void;
  onOpenFlashcards: () => void;
  allExpanded: boolean;
  onToggleAllExpanded: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  activeView,
  onViewChange,
  onOpenFlashcards,
  allExpanded,
  onToggleAllExpanded,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="bg-[var(--bg-surface)] border-b border-[var(--border-color)] py-5 no-print transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand & Subtitle */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--accent-primary)]">
              CS-301: Operating Systems
            </h1>
            <div className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
              Module 2 — Process Management (Weeks 3–5)
            </div>
            <div className="inline-block font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--accent-secondary-bg)] text-[var(--accent-secondary)]">
              Hook → Breakdown → Terms
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* View Switcher: Curriculum vs Lab Simulators */}
            <div className="flex items-center p-1 bg-[var(--code-bg)] border border-[var(--border-color)] rounded-lg text-xs font-medium">
              <button
                onClick={() => onViewChange('curriculum')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeView === 'curriculum'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] font-bold shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Curriculum View
              </button>
              <button
                onClick={() => onViewChange('simulators')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                  activeView === 'simulators'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] font-bold shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Lab Simulators
              </button>
            </div>

            {/* Flashcards Modal Button */}
            <button
              onClick={onOpenFlashcards}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--chip-bg)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors"
              title="Practice Terminology Flashcards"
            >
              <BookOpen className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Lexicon Quiz</span>
            </button>

            {/* Expand / Collapse All */}
            {activeView === 'curriculum' && (
              <button
                onClick={onToggleAllExpanded}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--chip-bg)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {allExpanded ? 'Collapse All' : 'Expand All'}
              </button>
            )}

            {/* Print Action */}
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--code-bg)] transition-colors"
              title="Print Curriculum"
              aria-label="Print Curriculum"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--code-bg)] transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--accent-primary)]" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {activeView === 'curriculum' && (
          <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search lectures, analogies, terms (e.g. fork, PCB, quantum, MLFQ)..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--code-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium underline"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
