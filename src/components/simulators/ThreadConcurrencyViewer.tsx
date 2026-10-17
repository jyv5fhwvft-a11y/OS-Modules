import React, { useState } from 'react';
import { Play, RotateCcw, Lock, Unlock, Users, AlertCircle } from 'lucide-react';

export const ThreadConcurrencyViewer: React.FC = () => {
  const [useMutex, setUseMutex] = useState(false);
  const [sharedCounter, setSharedCounter] = useState(0);
  const [thread1State, setThread1State] = useState<'IDLE' | 'READ' | 'INCREMENT' | 'WRITE'>('IDLE');
  const [thread2State, setThread2State] = useState<'IDLE' | 'READ' | 'INCREMENT' | 'WRITE'>('IDLE');
  const [thread1Local, setThread1Local] = useState<number | null>(null);
  const [thread2Local, setThread2Local] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([
    'Process initialized: Heap & Data shared, Thread Stacks isolated.'
  ]);

  const simulateRaceCondition = () => {
    // If mutex is NOT used, threads read old value at the same time:
    if (!useMutex) {
      const initial = sharedCounter;
      setThread1State('READ');
      setThread2State('READ');
      setThread1Local(initial);
      setThread2Local(initial);

      setTimeout(() => {
        setThread1State('INCREMENT');
        setThread2State('INCREMENT');
        setThread1Local(initial + 1);
        setThread2Local(initial + 1);
      }, 500);

      setTimeout(() => {
        setThread1State('WRITE');
        setThread2State('WRITE');
        // Race condition: Both write initial + 1, so 1 update was LOST!
        setSharedCounter(initial + 1);
        setLog(prev => [
          `⚠️ RACE CONDITION! Both Thread 1 and Thread 2 read counter=${initial}. Both computed ${initial + 1} and wrote it back. Expected ${initial + 2}, but got ${initial + 1}! (Lost Update)`,
          ...prev.slice(0, 4)
        ]);
      }, 1000);

      setTimeout(() => {
        setThread1State('IDLE');
        setThread2State('IDLE');
      }, 1500);
    } else {
      // Synchronized with Mutex
      const initial = sharedCounter;
      setThread1State('READ');
      setThread2State('IDLE');
      setThread1Local(initial);
      setLog(prev => [
        `🔒 Thread 1 acquired Mutex lock. Thread 2 is blocked waiting for lock.`,
        ...prev.slice(0, 4)
      ]);

      setTimeout(() => {
        setThread1State('INCREMENT');
        setThread1Local(initial + 1);
      }, 400);

      setTimeout(() => {
        setThread1State('WRITE');
        setSharedCounter(initial + 1);
        setThread1State('IDLE');

        // Now Thread 2 acquires lock
        setThread2State('READ');
        setThread2Local(initial + 1);
        setLog(prev => [
          `🔓 Thread 1 released lock (counter=${initial + 1}). Thread 2 acquires Mutex.`,
          ...prev.slice(0, 4)
        ]);
      }, 800);

      setTimeout(() => {
        setThread2State('INCREMENT');
        setThread2Local(initial + 2);
      }, 1200);

      setTimeout(() => {
        setThread2State('WRITE');
        setSharedCounter(initial + 2);
        setThread2State('IDLE');
        setLog(prev => [
          `✅ SUCCESS: Mutex prevented race condition. Final counter = ${initial + 2}.`,
          ...prev.slice(0, 4)
        ]);
      }, 1600);
    }
  };

  const resetAll = () => {
    setSharedCounter(0);
    setThread1State('IDLE');
    setThread2State('IDLE');
    setThread1Local(null);
    setThread2Local(null);
    setLog(['Reset state to 0.']);
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div>
          <h4 className="text-base font-bold text-[var(--accent-primary)] flex items-center gap-2">
            <span>🧵</span> Interactive Thread Concurrency &amp; Memory Sharing (L09)
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Visualize shared Heap/Data space versus private Thread Stacks, and simulate concurrent race conditions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseMutex(!useMutex)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
              useMutex
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-[var(--chip-bg)] text-[var(--text-primary)] border-[var(--border-color)]'
            }`}
          >
            {useMutex ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {useMutex ? 'Mutex Lock Enabled' : 'No Lock (Race Condition)'}
          </button>

          <button
            onClick={simulateRaceCondition}
            disabled={thread1State !== 'IDLE' || thread2State !== 'IDLE'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors"
          >
            <Play className="w-3.5 h-3.5" /> Run Concurrent Increment (+2)
          </button>

          <button
            onClick={resetAll}
            className="p-1.5 rounded border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Reset counter"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Shared Space vs Private Thread Stacks Box */}
      <div className="space-y-4 font-mono text-xs">
        {/* Shared Process Address Space */}
        <div className="border-2 border-dashed border-[var(--accent-primary)] bg-[var(--code-bg)] p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--accent-primary)] flex items-center gap-1.5">
              <span>🏢</span> Parent Process Address Space (PID: 5012)
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-sans">
              Shared by all sibling threads: Code, Data, Heap, File Descriptors
            </span>
          </div>

          {/* Shared Global Variable Counter */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-3 rounded-lg flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[11px] text-[var(--text-muted)]">Shared Global Data: volatile int counter</div>
              <div className="text-xl font-bold font-mono text-[var(--accent-primary)] mt-0.5">
                counter = {sharedCounter}
              </div>
            </div>
            <div className="text-right text-[11px] text-[var(--text-muted)]">
              Address: <code className="font-bold">0x00405080</code>
              <div>Protection: {useMutex ? 'Locked via pthread_mutex_t' : 'Unprotected'}</div>
            </div>
          </div>

          {/* Sibling Threads side-by-side inside the process */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Thread 1 */}
            <div className="bg-[var(--bg-surface)] border border-blue-400 dark:border-blue-800 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-1.5">
                <span className="font-bold text-blue-600 dark:text-blue-400">Thread 1 (TID: 0x7001)</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  thread1State === 'IDLE' ? 'bg-stone-200 dark:bg-stone-700' : 'bg-blue-600 text-white'
                }`}>
                  {thread1State}
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Private Stack Frame:</span>
                  <span>0x7ff01000 ($RSP)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">CPU Register %RAX:</span>
                  <span className="font-bold">{thread1Local !== null ? thread1Local : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Current Instruction:</span>
                  <span className="text-blue-600">
                    {thread1State === 'READ' && 'movl counter, %eax'}
                    {thread1State === 'INCREMENT' && 'addl $1, %eax'}
                    {thread1State === 'WRITE' && 'movl %eax, counter'}
                    {thread1State === 'IDLE' && 'pthread_exit()'}
                  </span>
                </div>
              </div>
            </div>

            {/* Thread 2 */}
            <div className="bg-[var(--bg-surface)] border border-emerald-400 dark:border-emerald-800 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-1.5">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Thread 2 (TID: 0x7002)</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  thread2State === 'IDLE' ? 'bg-stone-200 dark:bg-stone-700' : 'bg-emerald-600 text-white'
                }`}>
                  {thread2State}
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Private Stack Frame:</span>
                  <span>0x7ff02000 ($RSP)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">CPU Register %RAX:</span>
                  <span className="font-bold">{thread2Local !== null ? thread2Local : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Current Instruction:</span>
                  <span className="text-emerald-600">
                    {thread2State === 'READ' && 'movl counter, %eax'}
                    {thread2State === 'INCREMENT' && 'addl $1, %eax'}
                    {thread2State === 'WRITE' && 'movl %eax, counter'}
                    {thread2State === 'IDLE' && 'pthread_exit()'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Console Event Log */}
        <div className="bg-[var(--code-bg)] border border-[var(--border-color)] p-3 rounded-lg text-xs font-mono space-y-1">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Concurrency Execution Output:</div>
          {log.map((entry, idx) => (
            <div key={idx} className="text-[var(--text-primary)]">
              {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
