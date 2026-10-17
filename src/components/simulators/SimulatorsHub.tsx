import React, { useState } from 'react';
import { CPUSchedulerSimulator } from './CPUSchedulerSimulator';
import { PCBMemoryInspector } from './PCBMemoryInspector';
import { ForkExecVisualizer } from './ForkExecVisualizer';
import { MLFQSimulator } from './MLFQSimulator';
import { ThreadConcurrencyViewer } from './ThreadConcurrencyViewer';
import { Cpu, Split, Layers, Scale, Users } from 'lucide-react';

export const SimulatorsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scheduler' | 'pcb' | 'fork' | 'mlfq' | 'threads'>('scheduler');

  const tools = [
    { id: 'scheduler', name: 'CPU Scheduling (Lab 02 / L07)', icon: Cpu },
    { id: 'pcb', name: 'PCB & Memory Layout (L05)', icon: Layers },
    { id: 'fork', name: 'fork() & exec() Mechanics (L06)', icon: Split },
    { id: 'mlfq', name: 'MLFQ & Priority Inversion (L08)', icon: Scale },
    { id: 'threads', name: 'Thread Concurrency & Races (L09)', icon: Users },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Simulator Switcher Navigation */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-2.5 shadow-sm">
        <div className="flex overflow-x-auto gap-2 no-scrollbar">
          {tools.map(tool => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm'
                    : 'bg-[var(--code-bg)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tool.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Simulator Display */}
      <div>
        {activeTab === 'scheduler' && <CPUSchedulerSimulator />}
        {activeTab === 'pcb' && <PCBMemoryInspector />}
        {activeTab === 'fork' && <ForkExecVisualizer />}
        {activeTab === 'mlfq' && <MLFQSimulator />}
        {activeTab === 'threads' && <ThreadConcurrencyViewer />}
      </div>
    </div>
  );
};
