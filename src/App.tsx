import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ThesisCallout } from './components/ThesisCallout';
import { TableOfContents } from './components/TableOfContents';
import { LectureCard } from './components/LectureCard';
import { LabCard } from './components/LabCard';
import { SimulatorsHub } from './components/simulators/SimulatorsHub';
import { FlashcardsModal } from './components/FlashcardsModal';
import { CURRICULUM_LECTURES } from './data/curriculum';

export default function App() {
  // Theme state with localStorage persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // View state: 'curriculum' | 'simulators'
  const [activeView, setActiveView] = useState<'curriculum' | 'simulators'>('curriculum');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Flashcards state
  const [showFlashcards, setShowFlashcards] = useState(false);

  // Collapse state for lecture cards (default all open)
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allExpanded = useMemo(() => {
    return CURRICULUM_LECTURES.every(l => !collapsedMap[l.id]);
  }, [collapsedMap]);

  const toggleAllExpanded = () => {
    if (allExpanded) {
      // Collapse all
      const next: Record<string, boolean> = {};
      CURRICULUM_LECTURES.forEach(l => {
        next[l.id] = true;
      });
      setCollapsedMap(next);
    } else {
      // Expand all
      setCollapsedMap({});
    }
  };

  // Active section for TOC scroll spy
  const [activeSection, setActiveSection] = useState<string>('lecture-05');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    // Expand if collapsed
    if (collapsedMap[id]) {
      setCollapsedMap(prev => ({ ...prev, [id]: false }));
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // IntersectionObserver for TOC scroll spy
  useEffect(() => {
    if (activeView !== 'curriculum') return;

    const ids = [...CURRICULUM_LECTURES.map(l => l.id), 'lab-02'];
    const elements = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [activeView]);

  // Expand all when printing
  useEffect(() => {
    const handleBeforePrint = () => {
      setCollapsedMap({});
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    return () => window.removeEventListener('beforeprint', handleBeforePrint);
  }, []);

  // Filter lectures based on search query
  const filteredLectures = useMemo(() => {
    if (!searchQuery.trim()) return CURRICULUM_LECTURES;
    const q = searchQuery.toLowerCase();
    return CURRICULUM_LECTURES.filter(l => {
      const matchTitle = l.fullTitle.toLowerCase().includes(q);
      const matchObjective = l.objective.toLowerCase().includes(q);
      const matchCore = l.coreBreakdown.some(b => b.toLowerCase().includes(q));
      const matchTerms = l.terms.some(t => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q));
      const matchActivity = l.activity.title.toLowerCase().includes(q) || l.activity.description.toLowerCase().includes(q);
      return matchTitle || matchObjective || matchCore || matchTerms || matchActivity;
    });
  }, [searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      {/* 3.1 Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenFlashcards={() => setShowFlashcards(true)}
        allExpanded={allExpanded}
        onToggleAllExpanded={toggleAllExpanded}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 flex-1 flex flex-col">
        {/* 3.2 Pedagogical Thesis Callout */}
        <ThesisCallout />

        {/* View Content */}
        {activeView === 'simulators' ? (
          <div className="mb-12">
            <SimulatorsHub />
          </div>
        ) : (
          /* Main Curriculum Layout (Desktop Grid: Sidebar TOC + Lecture Stream) */
          <div className="content-layout">
            {/* 3.3 Sticky Table of Contents */}
            <TableOfContents
              activeId={activeSection}
              onSelectSection={scrollToSection}
            />

            {/* 3.4 Lectures Stream & Lab 02 */}
            <main className="lectures-stream">
              {filteredLectures.length === 0 ? (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-8 text-center text-[var(--text-muted)] space-y-2">
                  <p className="font-semibold text-sm">No lecture materials matched "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-[var(--accent-primary)] font-bold underline cursor-pointer"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                filteredLectures.map(lecture => (
                  <LectureCard
                    key={lecture.id}
                    lecture={lecture}
                    isCollapsed={!!collapsedMap[lecture.id]}
                    onToggleCollapse={() => toggleCollapse(lecture.id)}
                  />
                ))
              )}

              {/* Lab 02 Section */}
              {(!searchQuery || 'lab 02 scheduling benchmark'.includes(searchQuery.toLowerCase())) && (
                <LabCard />
              )}
            </main>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-[var(--bg-surface)] border-t border-[var(--border-color)] py-8 text-center text-xs text-[var(--text-muted)] no-print">
        <div className="w-full max-w-[1400px] mx-auto px-4">
          CS-301: Operating Systems — Module 2: Process Management (Weeks 3–5)
        </div>
      </footer>

      {/* Flashcards Quiz Modal */}
      <FlashcardsModal
        isOpen={showFlashcards}
        onClose={() => setShowFlashcards(false)}
      />
    </div>
  );
}
