import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, RotateCw, Check, BookOpen } from 'lucide-react';
import { CURRICULUM_LECTURES } from '../data/curriculum';

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({ isOpen, onClose }) => {
  // Aggregate all terms from all lectures
  const allTerms = React.useMemo(() => {
    return CURRICULUM_LECTURES.flatMap(l => 
      l.terms.map(t => ({
        ...t,
        lecture: l.number,
        lectureTitle: l.title
      }))
    );
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learned, setLearned] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const currentTerm = allTerms[currentIndex];
  const isMastered = !!learned[currentTerm.term];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % allTerms.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + allTerms.length) % allTerms.length);
  };

  const toggleLearned = () => {
    setLearned(prev => ({
      ...prev,
      [currentTerm.term]: !prev[currentTerm.term]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--accent-primary)]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              Module 2 Lexicon Flashcards ({currentIndex + 1}/{allTerms.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--code-bg)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 flex flex-col items-center">
          <div className="w-full flex justify-between items-center text-xs text-[var(--text-muted)] mb-3">
            <span>Lecture {currentTerm.lecture}: {currentTerm.lectureTitle}</span>
            <span className="font-mono">
              Mastered: {Object.values(learned).filter(Boolean).length} / {allTerms.length}
            </span>
          </div>

          {/* Interactive Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-56 rounded-xl border border-[var(--border-color)] bg-[var(--code-bg)] p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--accent-primary)] transition-all shadow-sm select-none relative group"
          >
            <span className="absolute top-3 right-3 text-[11px] text-[var(--text-muted)] flex items-center gap-1">
              <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" /> Click to flip
            </span>

            {!isFlipped ? (
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-[var(--accent-secondary)] font-bold">
                  Operating System Term
                </span>
                <h4 className="text-2xl font-bold font-mono text-[var(--accent-primary)]">
                  {currentTerm.term}
                </h4>
                <p className="text-xs text-[var(--text-muted)] pt-2">
                  What is the architectural definition in process management?
                </p>
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in duration-200">
                <span className="text-xs uppercase tracking-wider text-[var(--accent-primary)] font-bold">
                  Definition &amp; Operational Context
                </span>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                  {currentTerm.definition}
                </p>
              </div>
            )}
          </div>

          {/* Mark Mastered */}
          <button
            onClick={toggleLearned}
            className={`mt-4 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              isMastered
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            {isMastered ? 'Marked as Mastered' : 'Mark as Mastered'}
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--border-color)] bg-[var(--code-bg)]">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
          <div className="flex gap-1">
            {allTerms.map((t, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  currentIndex === idx
                    ? 'bg-[var(--accent-primary)]'
                    : learned[t.term]
                    ? 'bg-emerald-500'
                    : 'bg-stone-300 dark:bg-stone-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)] transition-colors"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
