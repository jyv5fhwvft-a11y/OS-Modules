import React, { useState } from 'react';
import { ChevronDown, Copy, Check, Play, ExternalLink } from 'lucide-react';
import { LectureData } from '../types';
import { PCBMemoryInspector } from './simulators/PCBMemoryInspector';
import { ForkExecVisualizer } from './simulators/ForkExecVisualizer';
import { CPUSchedulerSimulator } from './simulators/CPUSchedulerSimulator';
import { MLFQSimulator } from './simulators/MLFQSimulator';
import { ThreadConcurrencyViewer } from './simulators/ThreadConcurrencyViewer';

interface LectureCardProps {
  lecture: LectureData;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const LectureCard: React.FC<LectureCardProps> = ({
  lecture,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(lecture.codeExample.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Syntax highlighting helper for C and Text examples
  const renderHighlightedCode = (code: string) => {
    // If it's pure text, render directly
    if (lecture.codeExample.language !== 'c') {
      return <span>{code}</span>;
    }

    // Split lines and do lightweight regex tokenization
    const lines = code.split('\n');
    return lines.map((line, lIdx) => {
      // Check comment line
      if (line.trim().startsWith('//')) {
        return (
          <div key={lIdx} className="c-cmt">
            {line}
          </div>
        );
      }

      // Check preprocessor directive
      if (line.trim().startsWith('#')) {
        const parts = line.split(/(<[^>]+>|"[^"]+")/);
        return (
          <div key={lIdx}>
            <span className="c-kw">{parts[0]}</span>
            {parts[1] && <span className="c-str">{parts[1]}</span>}
          </div>
        );
      }

      // Keyword / function matching
      const tokens = line.split(/(\b(?:struct|enum|int|unsigned|long|void|char|return|if|else|wait|fork|execv|printf|fprintf|getpid|pthread_create|pthread_join|pthread_self|pthread_t|pid_t|NULL)\b|"[^"]*"|\d+)/g);

      return (
        <div key={lIdx}>
          {tokens.map((tok, tIdx) => {
            if (['struct', 'enum', 'return', 'if', 'else', 'NULL'].includes(tok)) {
              return <span key={tIdx} className="c-kw">{tok}</span>;
            }
            if (['int', 'unsigned', 'long', 'void', 'char', 'pid_t', 'pthread_t'].includes(tok)) {
              return <span key={tIdx} className="c-typ">{tok}</span>;
            }
            if (['fork', 'execv', 'printf', 'fprintf', 'getpid', 'pthread_create', 'pthread_join', 'pthread_self', 'main'].includes(tok)) {
              return <span key={tIdx} className="c-fn">{tok}</span>;
            }
            if (tok.startsWith('"')) {
              return <span key={tIdx} className="c-str">{tok}</span>;
            }
            if (/^\d+$/.test(tok)) {
              return <span key={tIdx} className="c-num">{tok}</span>;
            }
            return <span key={tIdx}>{tok}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <article
      id={lecture.id}
      className={`bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg shadow-sm transition-all duration-200 overflow-hidden hover:shadow-md ${
        isCollapsed ? 'mb-4' : 'mb-6'
      }`}
    >
      {/* Card Header Toggle Button */}
      <button
        onClick={onToggleCollapse}
        aria-expanded={!isCollapsed}
        className="w-full text-left bg-transparent border-none p-5 cursor-pointer flex justify-between items-center gap-4 text-inherit font-inherit border-b border-[var(--border-color)] hover:bg-[var(--code-bg)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">📘</span>
          <h2 className="text-base sm:text-lg font-bold text-[var(--accent-primary)] tracking-tight">
            {lecture.fullTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-5 h-5 text-[var(--text-muted)] transition-transform duration-200 ${
              isCollapsed ? '-rotate-90' : 'rotate-0'
            }`}
          />
        </div>
      </button>

      {/* Card Content (Collapsible) */}
      {!isCollapsed && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-150">
          {/* Quick Interactive Simulator Trigger */}
          {lecture.simulatorType && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--accent-secondary-bg)] border border-[var(--accent-secondary)] no-print">
              <div className="text-xs text-[var(--accent-secondary)] font-semibold flex items-center gap-1.5">
                <Play className="w-4 h-4 fill-current" />
                <span>Hands-on Laboratory Simulation Available for {lecture.number}</span>
              </div>
              <button
                onClick={() => setShowSimulator(!showSimulator)}
                className="px-3 py-1 bg-[var(--accent-secondary)] text-white text-xs font-bold rounded hover:opacity-90 transition-opacity"
              >
                {showSimulator ? 'Hide Interactive Lab' : 'Launch Interactive Lab'}
              </button>
            </div>
          )}

          {/* Embedded Simulator if toggled */}
          {showSimulator && lecture.simulatorType && (
            <div className="no-print pt-2 pb-4">
              {lecture.simulatorType === 'pcb' && <PCBMemoryInspector />}
              {lecture.simulatorType === 'fork' && <ForkExecVisualizer />}
              {lecture.simulatorType === 'scheduler' && <CPUSchedulerSimulator />}
              {lecture.simulatorType === 'mlfq' && <MLFQSimulator />}
              {lecture.simulatorType === 'threads' && <ThreadConcurrencyViewer />}
            </div>
          )}

          {/* 🎯 Objective */}
          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>🎯</span> Objective
            </h3>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed font-normal">
              {lecture.objective}
            </p>
          </section>

          {/* 🛑 Prerequisites */}
          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>🛑</span> Prerequisites
            </h3>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed font-normal">
              {lecture.prerequisites}
            </p>
          </section>

          {/* 🎪 Analogy 1 (Everyday Life) */}
          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>🎪</span> Analogy 1 (Everyday Life) — {lecture.analogyEveryday.title}
            </h3>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed font-normal">
              {lecture.analogyEveryday.description}
            </p>
          </section>

          {/* 💻 Analogy 2 (Pure Technical) */}
          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>💻</span> Analogy 2 (Pure Technical) — {lecture.analogyTechnical.title}
            </h3>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed font-normal">
              {lecture.analogyTechnical.description}
            </p>
          </section>

          {/* 🔗 System Cohesion Matrix */}
          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>🔗</span> System Cohesion Matrix
            </h3>
            <div
              className="p-3.5 rounded-r-lg space-y-1.5 text-xs sm:text-sm font-normal"
              style={{
                backgroundColor: 'var(--code-bg)',
                borderLeft: '4px solid var(--accent-secondary)',
              }}
            >
              <div>
                <span className="font-bold" style={{ color: 'var(--accent-secondary)' }}>
                  Relies On:{' '}
                </span>
                <span className="text-[var(--text-primary)]">{lecture.cohesion.reliesOn}</span>
              </div>
              <div>
                <span className="font-bold" style={{ color: 'var(--accent-secondary)' }}>
                  Feeds Into:{' '}
                </span>
                <span className="text-[var(--text-primary)]">{lecture.cohesion.feedsInto}</span>
              </div>
            </div>
          </section>

          {/* 🔍 Core Breakdown */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>🔍</span> Core Breakdown
            </h3>
            <div className="space-y-2">
              {lecture.coreBreakdown.map((paragraph, pIdx) => (
                <p key={pIdx} className="text-sm text-[var(--text-primary)] leading-relaxed font-normal">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          {/* 🏷️ Lexicon / Terms */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>🏷️</span> Lexicon / Terms
            </h3>
            <div className="grid grid-cols-1 gap-2 pt-1">
              {lecture.terms.map((t, tIdx) => (
                <div
                  key={tIdx}
                  className="bg-[var(--chip-bg)] border border-[var(--chip-border)] rounded-md p-3 text-xs sm:text-sm space-y-1"
                >
                  <span className="font-mono font-bold text-[var(--accent-primary)] block">
                    {t.term}:
                  </span>
                  <span className="text-[var(--text-primary)] font-normal leading-relaxed block">
                    {t.definition}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 🛠️ Practical Example */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>🛠️</span> Practical Example {lecture.codeExample.title ? `— ${lecture.codeExample.title}` : ''}
              </h3>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 py-1 rounded bg-[var(--code-bg)] border border-[var(--border-color)] transition-colors no-print"
                title="Copy code to clipboard"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="bg-[var(--code-bg)] border border-[var(--code-border)] rounded-md p-3.5 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
              <pre>
                <code>{renderHighlightedCode(lecture.codeExample.code)}</code>
              </pre>
            </div>
          </section>

          {/* 🎯 Interactive Classroom Activity */}
          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>🎯</span> Interactive Classroom Activity — {lecture.activity.title}
            </h3>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed font-normal">
              {lecture.activity.description}
            </p>
          </section>

          {/* 🌿 Mindmap Branch */}
          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>🌿</span> Mindmap Branch
            </h3>
            <div className="bg-[var(--code-bg)] border border-[var(--code-border)] rounded-md p-3.5 font-mono text-xs overflow-x-auto text-[var(--text-primary)]">
              <pre>{lecture.mindmap}</pre>
            </div>
          </section>

          {/* 🌐 Interactive Mindmap URL */}
          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>🌐</span> Interactive Mindmap URL
            </h3>
            <div className="bg-[var(--chip-bg)] border border-[var(--border-color)] rounded-md p-2.5 font-mono text-xs text-[var(--text-primary)] break-all flex items-center justify-between gap-2">
              <span>{lecture.mindmapUrl}</span>
              <a
                href={lecture.mindmapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1 text-xs shrink-0"
              >
                Open <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </section>
        </div>
      )}
    </article>
  );
};
