import React from 'react';

export const ThesisCallout: React.FC = () => {
  return (
    <aside
      className="my-8 rounded-lg p-5 sm:p-6 transition-colors shadow-sm"
      style={{
        backgroundColor: 'var(--callout-bg)',
        border: '1px solid var(--callout-border)',
        borderLeft: '5px solid var(--callout-border)',
      }}
      role="note"
      aria-label="Module 2 Pedagogical Thesis"
    >
      <div
        className="text-lg font-bold mb-2 flex items-center gap-2"
        style={{ color: 'var(--callout-text)' }}
      >
        <span>⚡</span> Module 2 Thesis: The Active Actors
      </div>
      <p
        className="text-base leading-relaxed font-normal"
        style={{ color: 'var(--text-primary)' }}
      >
        Now that our architecture exists, we need to create the actors that will use it. We have dozens of independent programs that want to run, but a strictly limited number of physical CPU cores. How do we share processor time fairly, safely, and rapidly?
      </p>
    </aside>
  );
};
