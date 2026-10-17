import React, { useState } from 'react';
import { ArrowRight, RotateCcw, Copy, Play, Check } from 'lucide-react';

export const ForkExecVisualizer: React.FC = () => {
  const [step, setStep] = useState<number>(0);

  const steps = [
    {
      title: '1. Initial State: Parent Process Running',
      description: 'Parent process (PID: 1024) is executing instructions in user space. Variable x = 42.',
      parentState: { pid: 1024, ppid: 1000, prog: 'my_shell', varX: 42, pc: '0x004010a0' },
      childState: null,
      contextSwitch: false,
    },
    {
      title: '2. fork() System Call Triggered',
      description: 'The kernel clones the parent address space and PCB. Crucially: fork() returns rc = 1025 to Parent, but rc = 0 to Child!',
      parentState: { pid: 1024, ppid: 1000, prog: 'my_shell', varX: 42, rc: 1025, pc: '0x004010b0' },
      childState: { pid: 1025, ppid: 1024, prog: 'my_shell (clone)', varX: 42, rc: 0, pc: '0x004010b0' },
      contextSwitch: false,
    },
    {
      title: '3. Memory Isolation Demonstrated',
      description: 'Child modifies x = 99. Because address spaces are completely isolated (Copy-on-Write), Parent retains x = 42!',
      parentState: { pid: 1024, ppid: 1000, prog: 'my_shell', varX: 42, rc: 1025, pc: 'wait(&status)' },
      childState: { pid: 1025, ppid: 1024, prog: 'my_shell (clone)', varX: 99, rc: 0, pc: '0x004010c8' },
      contextSwitch: false,
    },
    {
      title: '4. execv("/bin/ls") Called by Child',
      description: 'The child address space is wiped clean! The new "/bin/ls" binary is loaded into Text/Data. PID 1025 remains identical.',
      parentState: { pid: 1024, ppid: 1000, prog: 'my_shell', varX: 42, status: 'WAITING (Blocked on child)' },
      childState: { pid: 1025, ppid: 1024, prog: '/bin/ls -l', varX: null, memory: 'NEW BINARY IMAGE' },
      contextSwitch: true,
    },
    {
      title: '5. Child Terminates & Parent Reaps via wait()',
      description: 'Child finishes execution and exits (status: 0). Parent wait() returns, reclaiming child PCB resources (preventing zombies!).',
      parentState: { pid: 1024, ppid: 1000, prog: 'my_shell', varX: 42, status: 'RUNNING (Child Reaped)' },
      childState: { pid: 1025, status: 'TERMINATED / REAPED' },
      contextSwitch: false,
    },
  ];

  const current = steps[step];

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div>
          <h4 className="text-base font-bold text-[var(--accent-primary)] flex items-center gap-2">
            <span>🧬</span> Interactive fork() &amp; exec() Execution Mechanics (L06)
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Trace how Unix forks clone address spaces and exec overrides them into new binaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep(prev => Math.min(steps.length - 1, prev + 1))}
            disabled={step === steps.length - 1}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors"
          >
            Next Step <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setStep(0)}
            className="p-1.5 rounded border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Reset to step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
        {steps.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setStep(idx)}
            className={`flex-1 py-1.5 px-2 text-center text-xs font-semibold rounded border transition-colors whitespace-nowrap ${
              step === idx
                ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                : idx < step
                ? 'bg-[var(--accent-secondary-bg)] text-[var(--accent-secondary)] border-[var(--accent-secondary)]'
                : 'bg-[var(--code-bg)] text-[var(--text-muted)] border-[var(--border-color)]'
            }`}
          >
            Step {idx + 1}
          </button>
        ))}
      </div>

      {/* Step Explanation Callout */}
      <div className="bg-[var(--code-bg)] border-l-4 border-l-[var(--accent-primary)] p-3 rounded-r-lg">
        <h5 className="font-bold text-sm text-[var(--text-primary)]">{current.title}</h5>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{current.description}</p>
      </div>

      {/* Process Containers Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Parent Process Card */}
        <div className="border border-blue-300 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-900/50 pb-2">
            <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <span>👤</span> Parent Process (PID: {current.parentState.pid})
            </span>
            <span className="text-[11px] px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded text-blue-800 dark:text-blue-200">
              PPID: {current.parentState.ppid}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Binary Image:</span>
              <span className="font-bold">{current.parentState.prog}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Variable (int x):</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{current.parentState.varX}</span>
            </div>
            {'rc' in current.parentState && (
              <div className="flex justify-between bg-blue-100/70 dark:bg-blue-900/40 p-1 rounded">
                <span className="text-blue-900 dark:text-blue-200">fork() return code:</span>
                <span className="font-bold text-blue-700 dark:text-blue-300">rc = {current.parentState.rc} (Child's PID)</span>
              </div>
            )}
            {'status' in current.parentState && (
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Scheduler State:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{current.parentState.status}</span>
              </div>
            )}
          </div>
        </div>

        {/* Child Process Card */}
        <div className="border border-emerald-300 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900/50 pb-2">
            <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <span>🌱</span> Child Process {current.childState ? `(PID: ${current.childState.pid})` : '(Not yet created)'}
            </span>
            {current.childState && 'ppid' in current.childState && (
              <span className="text-[11px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 rounded text-emerald-800 dark:text-emerald-200">
                PPID: {current.childState.ppid}
              </span>
            )}
          </div>

          {current.childState ? (
            <div className="space-y-1.5">
              {'prog' in current.childState && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Binary Image:</span>
                  <span className="font-bold">{current.childState.prog}</span>
                </div>
              )}
              {'varX' in current.childState && current.childState.varX !== null && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Variable (int x):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{current.childState.varX}</span>
                </div>
              )}
              {'rc' in current.childState && (
                <div className="flex justify-between bg-emerald-100/70 dark:bg-emerald-900/40 p-1 rounded">
                  <span className="text-emerald-900 dark:text-emerald-200">fork() return code:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">rc = {current.childState.rc} (Zero!)</span>
                </div>
              )}
              {'memory' in current.childState && (
                <div className="bg-amber-100/80 dark:bg-amber-950/50 p-1.5 rounded text-amber-800 dark:text-amber-300 text-[11px]">
                  ⚡ execv() replaced memory with /bin/ls machine instructions!
                </div>
              )}
              {'status' in current.childState && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">State:</span>
                  <span className="font-bold text-stone-500">{current.childState.status}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-[var(--text-muted)] italic">
              Child process does not exist yet. Click "Next Step" to fork().
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
