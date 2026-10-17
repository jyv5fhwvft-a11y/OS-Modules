import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { LAB_02_DATA } from '../data/curriculum';
import { CPUSchedulerSimulator } from './simulators/CPUSchedulerSimulator';

export const LabCard: React.FC = () => {
  const [showSim, setShowSim] = useState(false);

  return (
    <section
      id="lab-02"
      className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg shadow-sm overflow-hidden mb-8 transition-shadow hover:shadow-md"
      style={{ borderTop: '4px solid var(--accent-secondary)' }}
      data-lecture="lab-02"
    >
      <header className="p-5 border-b border-[var(--border-color)] bg-[var(--code-bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-base sm:text-lg font-bold" style={{ color: 'var(--accent-secondary)' }}>
          🧪 {LAB_02_DATA.title}
        </h2>
        <button
          onClick={() => setShowSim(!showSim)}
          className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-secondary)] text-white text-xs font-bold rounded hover:opacity-90 transition-opacity"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {showSim ? 'Hide Lab Simulator' : 'Launch Benchmark Simulator'}
        </button>
      </header>

      <div className="p-5 sm:p-6 space-y-4 text-sm leading-relaxed">
        {showSim && (
          <div className="no-print pb-4">
            <CPUSchedulerSimulator />
          </div>
        )}

        <div>
          <span className="font-bold text-[var(--text-primary)]">Lab Assignment Target: </span>
          <span className="text-[var(--text-primary)]">{LAB_02_DATA.target}</span>
        </div>

        <div>
          <span className="font-bold text-[var(--text-primary)]">Task Description: </span>
          <span className="text-[var(--text-primary)]">{LAB_02_DATA.description}</span>
        </div>

        <div>
          <span className="font-bold text-[var(--text-primary)]">Grading Weight Validation: </span>
          <span className="text-[var(--text-primary)]">{LAB_02_DATA.gradingWeight}</span>
        </div>
      </div>
    </section>
  );
};
