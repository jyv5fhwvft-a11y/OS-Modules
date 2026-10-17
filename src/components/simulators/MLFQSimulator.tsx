import React, { useState } from 'react';
import { Play, RotateCcw, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const MLFQSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mlfq' | 'inversion'>('mlfq');

  // MLFQ State
  const [queues, setQueues] = useState<{
    q0: { id: string; name: string; type: 'Interactive' | 'Batch'; burstLeft: number }[];
    q1: { id: string; name: string; type: 'Interactive' | 'Batch'; burstLeft: number }[];
    q2: { id: string; name: string; type: 'Interactive' | 'Batch'; burstLeft: number }[];
  }>({
    q0: [
      { id: '1', name: 'TextEditor (I/O)', type: 'Interactive', burstLeft: 1 },
      { id: '2', name: 'VideoRenderer (CPU)', type: 'Batch', burstLeft: 12 },
    ],
    q1: [
      { id: '3', name: 'WebBrowser Tab', type: 'Interactive', burstLeft: 3 },
    ],
    q2: [
      { id: '4', name: 'VirusScanner (Background)', type: 'Batch', burstLeft: 20 },
    ],
  });

  const [mlfqLog, setMlfqLog] = useState<string[]>([
    'System initialized. Q0 Quantum=2ms, Q1 Quantum=4ms, Q2 FCFS.'
  ]);

  // Step MLFQ Scheduler Tick
  const stepMlfq = () => {
    setQueues(prev => {
      const newQ0 = [...prev.q0];
      const newQ1 = [...prev.q1];
      const newQ2 = [...prev.q2];
      const newLog = [...mlfqLog];

      // Pick highest priority non-empty queue
      if (newQ0.length > 0) {
        const proc = newQ0.shift()!;
        if (proc.type === 'Interactive') {
          newLog.unshift(`[Q0 EXEC] ${proc.name} yielded for user input after 1ms. Stays in Q0!`);
          newQ0.push(proc);
        } else {
          // Used full 2ms slice, demote to Q1
          proc.burstLeft = Math.max(0, proc.burstLeft - 2);
          newLog.unshift(`[Q0 DEMOTION] ${proc.name} used entire 2ms quantum. Demoted to Q1!`);
          newQ1.push(proc);
        }
      } else if (newQ1.length > 0) {
        const proc = newQ1.shift()!;
        proc.burstLeft = Math.max(0, proc.burstLeft - 4);
        if (proc.burstLeft <= 0) {
          newLog.unshift(`[Q1 FINISHED] ${proc.name} finished execution!`);
        } else {
          newLog.unshift(`[Q1 DEMOTION] ${proc.name} burned 4ms slice in Q1. Demoted to Q2!`);
          newQ2.push(proc);
        }
      } else if (newQ2.length > 0) {
        const proc = newQ2.shift()!;
        proc.burstLeft = Math.max(0, proc.burstLeft - 5);
        newLog.unshift(`[Q2 BATCH] ${proc.name} ran in background queue Q2.`);
        if (proc.burstLeft > 0) newQ2.push(proc);
      }

      setMlfqLog(newLog.slice(0, 5));
      return { q0: newQ0, q1: newQ1, q2: newQ2 };
    });
  };

  const triggerAgingBoost = () => {
    setQueues(prev => {
      const all = [...prev.q0, ...prev.q1, ...prev.q2];
      setMlfqLog(l => ['⚡ PRIORITY BOOST: Periodic kernel timer expired! All tasks elevated to Q0 to prevent Starvation.', ...l.slice(0, 4)]);
      return {
        q0: all,
        q1: [],
        q2: [],
      };
    });
  };

  // Priority Inversion State
  const [priorityInheritanceEnabled, setPriorityInheritanceEnabled] = useState(false);
  const [inversionStep, setInversionStep] = useState(0);

  const inversionStages = [
    {
      title: 'Stage 1: Low Priority Task (TL) claims Mutex Lock',
      tl: { state: 'RUNNING', hasLock: true, effectivePriority: priorityInheritanceEnabled ? 'Low' : 'Low' },
      tm: { state: 'READY', hasLock: false },
      th: { state: 'SLEEPING (Waiting for timer)', hasLock: false },
      explanation: 'TL (Weather Gathering Daemon) starts running and acquires the shared memory mutex lock.'
    },
    {
      title: 'Stage 2: High Priority Task (TH) wakes up & needs the lock!',
      tl: { state: 'WAITING / PREEMPTED', hasLock: true, effectivePriority: priorityInheritanceEnabled ? 'HIGH (Inherited!)' : 'Low' },
      tm: { state: 'READY', hasLock: false },
      th: { state: 'BLOCKED (Waiting for mutex held by TL)', hasLock: false },
      explanation: 'TH (Attitude Control Bus) has the highest priority. It needs the mutex held by TL, so TH blocks in the kernel queue.'
    },
    {
      title: 'Stage 3: Medium Priority Task (TM) arrives without needing the lock',
      tl: {
        state: priorityInheritanceEnabled ? 'RUNNING (Finishing critical section under High Priority)' : 'STARVED (Preempted by TM)',
        hasLock: true,
        effectivePriority: priorityInheritanceEnabled ? 'HIGH (Inherited from TH)' : 'Low'
      },
      tm: {
        state: priorityInheritanceEnabled ? 'READY (Cannot preempt boosted TL)' : 'RUNNING (Preempted TL!)',
        hasLock: false
      },
      th: { state: 'BLOCKED (Starving!)', hasLock: false },
      explanation: priorityInheritanceEnabled
        ? 'SUCCESS: With Priority Inheritance, TL temporarily elevated to HIGH priority. TM cannot preempt TL! TL releases lock, TH executes immediately.'
        : 'TRAP: TM has higher base priority than TL, so TM preempts TL. TL cannot run to release the lock! Thus TH is indirectly blocked by TM forever (System Watchdog reset occurs!).'
    }
  ];

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div>
          <h4 className="text-base font-bold text-[var(--accent-primary)] flex items-center gap-2">
            <span>⚖️</span> MLFQ Queues &amp; Priority Inversion Sandbox (L08)
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Test adaptive feedback queues, Starvation aging fixes, and the famous Mars Pathfinder priority inversion glitch.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[var(--code-bg)] border border-[var(--border-color)] rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('mlfq')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'mlfq'
                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            MLFQ Dynamic Queues
          </button>
          <button
            onClick={() => setActiveTab('inversion')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'inversion'
                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Mars Pathfinder Trap
          </button>
        </div>
      </div>

      {activeTab === 'mlfq' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[var(--text-muted)]">
              Tasks automatically demote when consuming full time slices; I/O tasks remain high.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={stepMlfq}
                className="flex items-center gap-1 px-3 py-1.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white rounded font-semibold transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Execute 1 Quantum Tick
              </button>
              <button
                onClick={triggerAgingBoost}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Trigger Aging Boost (Anti-Starve)
              </button>
            </div>
          </div>

          {/* Three Tier Queues */}
          <div className="space-y-2.5 font-mono text-xs">
            {/* Queue 0 */}
            <div className="border border-blue-300 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg">
              <div className="flex items-center justify-between font-bold text-blue-700 dark:text-blue-300 mb-2">
                <span>⚡ Queue 0 (Top Priority) — Quantum: 2 ms</span>
                <span className="text-[11px] font-sans font-normal text-[var(--text-muted)]">Short interactive tasks</span>
              </div>
              <div className="flex flex-wrap gap-2 min-h-8 items-center">
                {queues.q0.length === 0 ? (
                  <span className="text-stone-400 italic text-[11px]">Empty</span>
                ) : (
                  queues.q0.map(p => (
                    <div key={p.id} className="bg-white dark:bg-stone-800 border border-blue-400 dark:border-blue-700 px-2.5 py-1 rounded shadow-sm flex items-center gap-2">
                      <span className="font-bold">{p.name}</span>
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900 px-1 rounded">{p.type}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{p.burstLeft}ms</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Queue 1 */}
            <div className="border border-emerald-300 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-lg">
              <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                <span>⏱️ Queue 1 (Medium Priority) — Quantum: 4 ms</span>
                <span className="text-[11px] font-sans font-normal text-[var(--text-muted)]">Intermediate tasks</span>
              </div>
              <div className="flex flex-wrap gap-2 min-h-8 items-center">
                {queues.q1.length === 0 ? (
                  <span className="text-stone-400 italic text-[11px]">Empty</span>
                ) : (
                  queues.q1.map(p => (
                    <div key={p.id} className="bg-white dark:bg-stone-800 border border-emerald-400 dark:border-emerald-700 px-2.5 py-1 rounded shadow-sm flex items-center gap-2">
                      <span className="font-bold">{p.name}</span>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 px-1 rounded">{p.type}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{p.burstLeft}ms</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Queue 2 */}
            <div className="border border-amber-300 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-lg">
              <div className="flex items-center justify-between font-bold text-amber-700 dark:text-amber-300 mb-2">
                <span>🐢 Queue 2 (Low Priority) — Policy: FCFS Batch</span>
                <span className="text-[11px] font-sans font-normal text-[var(--text-muted)]">Long background batch</span>
              </div>
              <div className="flex flex-wrap gap-2 min-h-8 items-center">
                {queues.q2.length === 0 ? (
                  <span className="text-stone-400 italic text-[11px]">Empty</span>
                ) : (
                  queues.q2.map(p => (
                    <div key={p.id} className="bg-white dark:bg-stone-800 border border-amber-400 dark:border-amber-700 px-2.5 py-1 rounded shadow-sm flex items-center gap-2">
                      <span className="font-bold">{p.name}</span>
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-900 px-1 rounded">{p.type}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{p.burstLeft}ms</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Log Window */}
          <div className="bg-[var(--code-bg)] border border-[var(--border-color)] p-3 rounded-lg font-mono text-xs space-y-1">
            <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Kernel MLFQ Event Log:</div>
            {mlfqLog.map((log, idx) => (
              <div key={idx} className="text-[var(--text-primary)]">
                {log}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Priority Inversion Sandbox */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--code-bg)] p-3 rounded-lg border border-[var(--border-color)]">
            <div className="text-xs">
              <div className="font-bold text-[var(--text-primary)]">Simulation Controls</div>
              <div className="text-[var(--text-muted)]">Toggle Priority Inheritance fix to resolve the deadlock</div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={priorityInheritanceEnabled}
                  onChange={e => setPriorityInheritanceEnabled(e.target.checked)}
                  className="rounded text-[var(--accent-primary)] focus:ring-0"
                />
                <span>Enable Priority Inheritance</span>
              </label>

              <button
                onClick={() => setInversionStep(prev => (prev + 1) % 3)}
                className="px-3 py-1.5 bg-[var(--accent-primary)] text-white text-xs font-semibold rounded hover:bg-[var(--accent-primary-hover)] transition-colors"
              >
                Next Stage ({inversionStep + 1}/3)
              </button>
            </div>
          </div>

          {/* Current Stage Card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-4 rounded-lg space-y-3 font-mono text-xs">
            <div className="font-bold text-sm text-[var(--accent-primary)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {inversionStages[inversionStep].title}
            </div>
            <p className="font-sans text-xs text-[var(--text-primary)] bg-[var(--code-bg)] p-2.5 rounded border border-[var(--border-color)]">
              {inversionStages[inversionStep].explanation}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Task High */}
              <div className="p-3 rounded border border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
                <div className="font-bold text-red-600 dark:text-red-400">TH: Attitude Control (HIGH)</div>
                <div className="mt-1 text-[11px]">State: {inversionStages[inversionStep].th.state}</div>
                <div className="text-[11px] text-[var(--text-muted)]">Needs: Mutex Lock</div>
              </div>

              {/* Task Medium */}
              <div className="p-3 rounded border border-amber-300 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                <div className="font-bold text-amber-600 dark:text-amber-400">TM: Communication (MEDIUM)</div>
                <div className="mt-1 text-[11px]">State: {inversionStages[inversionStep].tm.state}</div>
                <div className="text-[11px] text-[var(--text-muted)]">Needs: No locks (Just CPU)</div>
              </div>

              {/* Task Low */}
              <div className="p-3 rounded border border-blue-300 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
                <div className="font-bold text-blue-600 dark:text-blue-400">TL: Meteorology (LOW)</div>
                <div className="mt-1 text-[11px]">State: {inversionStages[inversionStep].tl.state}</div>
                <div className="text-[11px] font-semibold text-emerald-600">Holds Mutex Lock!</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Priority: {inversionStages[inversionStep].tl.effectivePriority}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
