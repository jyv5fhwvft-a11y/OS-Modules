import React, { useState } from 'react';
import { Play, RotateCcw, Cpu, Layers, HardDrive, FileText } from 'lucide-react';

export const PCBMemoryInspector: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<'text' | 'data' | 'heap' | 'stack'>('text');
  const [processState, setProcessState] = useState<'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED'>('RUNNING');
  const [pc, setPc] = useState<number>(0x004011a0);
  const [cycle, setCycle] = useState<number>(1);
  const [heapSizeKb, setHeapSizeKb] = useState<number>(64);
  const [stackFrames, setStackFrames] = useState<string[]>([
    'main(argc=1, argv)',
    'process_scheduler_init()',
    'allocate_matrix_worker()'
  ]);

  const stepCycle = () => {
    if (processState === 'TERMINATED') return;
    setCycle(prev => prev + 1);
    setPc(prev => prev + 4);
    if (cycle % 3 === 0 && stackFrames.length < 5) {
      setStackFrames(prev => [...prev, `compute_task_sub_${cycle}()`]);
      setHeapSizeKb(prev => prev + 16);
    } else if (cycle % 4 === 0 && stackFrames.length > 1) {
      setStackFrames(prev => prev.slice(0, prev.length - 1));
    }
  };

  const resetState = () => {
    setCycle(1);
    setPc(0x004011a0);
    setProcessState('RUNNING');
    setHeapSizeKb(64);
    setStackFrames(['main(argc=1, argv)', 'process_scheduler_init()', 'allocate_matrix_worker()']);
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-5 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div>
          <h4 className="text-base font-bold text-[var(--accent-primary)] flex items-center gap-2">
            <span>🧬</span> Interactive Process Address Space &amp; PCB Ledger (L05)
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Explore physical segment boundaries (Stack, Heap, Data, Text) and the kernel <code className="text-xs font-mono">task_struct</code> ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={stepCycle}
            disabled={processState === 'TERMINATED'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors"
          >
            <Play className="w-3.5 h-3.5" /> Step CPU Clock
          </button>
          <button
            onClick={resetState}
            className="p-1.5 rounded border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Reset simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Memory Segment Map */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
            <span>Virtual Memory Map (0x0000 → 0xFFFF)</span>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">Ring 3 User Address Space</span>
          </div>

          <div className="border border-[var(--border-color)] rounded-lg overflow-hidden flex flex-col font-mono text-xs">
            {/* Kernel Space */}
            <div className="bg-stone-300 dark:bg-stone-800 p-2 text-center text-stone-600 dark:text-stone-300 border-b border-[var(--border-color)] text-[11px]">
              🔒 Kernel Space (Ring 0 - Protected) [0xC0000000 - 0xFFFFFFFF]
            </div>

            {/* Stack Segment */}
            <button
              onClick={() => setSelectedSegment('stack')}
              className={`p-3 text-left border-b border-[var(--border-color)] transition-all ${
                selectedSegment === 'stack'
                  ? 'bg-amber-100 dark:bg-amber-950/60 font-bold border-l-4 border-l-amber-500'
                  : 'bg-[var(--bg-surface)] hover:bg-[var(--code-bg)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-amber-800 dark:text-amber-300">Stack Segment (↓ Grows Downward)</span>
                <span className="text-[11px] opacity-75">{stackFrames.length} frames active</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-sans mt-0.5">
                Local function parameters, return addresses, activation records ($RSP).
              </p>
            </button>

            {/* Free Memory / Gap */}
            <div className="p-3 bg-[var(--code-bg)] text-center text-[11px] text-[var(--text-muted)] border-b border-[var(--border-color)] flex items-center justify-center gap-2">
              <span>↕ Unallocated Virtual Memory Space (Available for Growth)</span>
            </div>

            {/* Heap Segment */}
            <button
              onClick={() => setSelectedSegment('heap')}
              className={`p-3 text-left border-b border-[var(--border-color)] transition-all ${
                selectedSegment === 'heap'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 font-bold border-l-4 border-l-emerald-500'
                  : 'bg-[var(--bg-surface)] hover:bg-[var(--code-bg)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-emerald-800 dark:text-emerald-300">Heap Segment (↑ Grows Upward)</span>
                <span className="text-[11px] opacity-75">{heapSizeKb} KB allocated</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-sans mt-0.5">
                Dynamic runtime allocations via <code className="font-mono">malloc()</code> and <code className="font-mono">brk/sbrk</code>.
              </p>
            </button>

            {/* Data Segment */}
            <button
              onClick={() => setSelectedSegment('data')}
              className={`p-3 text-left border-b border-[var(--border-color)] transition-all ${
                selectedSegment === 'data'
                  ? 'bg-blue-100 dark:bg-blue-950/60 font-bold border-l-4 border-l-blue-500'
                  : 'bg-[var(--bg-surface)] hover:bg-[var(--code-bg)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-blue-800 dark:text-blue-300">Data &amp; BSS Segment</span>
                <span className="text-[11px] opacity-75">Global variables</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-sans mt-0.5">
                Initialized and uninitialized global/static variables.
              </p>
            </button>

            {/* Text Segment */}
            <button
              onClick={() => setSelectedSegment('text')}
              className={`p-3 text-left transition-all ${
                selectedSegment === 'text'
                  ? 'bg-purple-100 dark:bg-purple-950/60 font-bold border-l-4 border-l-purple-500'
                  : 'bg-[var(--bg-surface)] hover:bg-[var(--code-bg)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-purple-800 dark:text-purple-300">Text Segment (Code - Read Only)</span>
                <span className="text-[11px] opacity-75 font-mono">0x{pc.toString(16)}</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-sans mt-0.5">
                Compiled machine instructions loaded directly from binary executable.
              </p>
            </button>
          </div>
        </div>

        {/* Right: The PCB Kernel Ledger Details */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-primary)]">Kernel Ledger: struct task_struct (PCB)</span>
            <span className="text-[11px] font-mono text-[var(--accent-secondary)]">Clock Cycles: #{cycle}</span>
          </div>

          {/* PCB Grid */}
          <div className="bg-[var(--code-bg)] border border-[var(--border-color)] rounded-lg p-4 space-y-4 font-mono text-xs">
            {/* Row 1: PID & State */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-surface)] p-2.5 rounded border border-[var(--border-color)]">
                <div className="text-[11px] text-[var(--text-muted)]">Process ID (PID)</div>
                <div className="text-sm font-bold text-[var(--accent-primary)] mt-0.5">4096 (Parent: 1024)</div>
              </div>

              <div className="bg-[var(--bg-surface)] p-2.5 rounded border border-[var(--border-color)]">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">Process State</div>
                <div className="flex items-center gap-1">
                  {(['READY', 'RUNNING', 'WAITING', 'TERMINATED'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setProcessState(st)}
                      className={`px-1.5 py-0.5 text-[10px] rounded font-bold transition-colors ${
                        processState === st
                          ? st === 'RUNNING'
                            ? 'bg-emerald-600 text-white'
                            : st === 'WAITING'
                            ? 'bg-amber-600 text-white'
                            : st === 'TERMINATED'
                            ? 'bg-red-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--chip-bg)]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Registers & Program Counter */}
            <div className="bg-[var(--bg-surface)] p-3 rounded border border-[var(--border-color)] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="font-bold text-[var(--text-primary)]">Hardware Register Cache</span>
                <span>Context Switch Storage Cache</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-1.5 rounded bg-[var(--code-bg)]">
                  <span className="text-[var(--text-muted)]">PC:</span> <span className="font-bold text-[var(--accent-primary)]">0x{pc.toString(16)}</span>
                </div>
                <div className="p-1.5 rounded bg-[var(--code-bg)]">
                  <span className="text-[var(--text-muted)]">RSP:</span> 0x7ffd9820
                </div>
                <div className="p-1.5 rounded bg-[var(--code-bg)]">
                  <span className="text-[var(--text-muted)]">RBP:</span> 0x7ffd9840
                </div>
                <div className="p-1.5 rounded bg-[var(--code-bg)]">
                  <span className="text-[var(--text-muted)]">RAX:</span> 0x0000000{cycle}
                </div>
              </div>
            </div>

            {/* Row 3: Active Segment Inspector Detail */}
            <div className="bg-[var(--bg-surface)] p-3 rounded border border-[var(--border-color)] space-y-1.5">
              <div className="text-[11px] font-bold text-[var(--accent-secondary)] uppercase">
                Active Inspector: {selectedSegment} Segment
              </div>
              {selectedSegment === 'stack' && (
                <div className="space-y-1">
                  <p className="text-[11px] text-[var(--text-muted)] font-sans">
                    Call stack frames (popped when functions return):
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {stackFrames.map((frame, i) => (
                      <li key={i} className="text-amber-700 dark:text-amber-300">
                        {frame} {i === stackFrames.length - 1 && '← Top of Stack ($RSP)'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedSegment === 'heap' && (
                <div className="space-y-1">
                  <p className="text-[11px] text-[var(--text-muted)] font-sans">
                    Active heap allocations tracked by kernel memory descriptor (<code className="font-mono">mm_struct</code>):
                  </p>
                  <div className="text-[11px] space-y-0.5 text-emerald-700 dark:text-emerald-300">
                    <div>• 0x01a04000: 32 KB chunk (BufferPool array)</div>
                    <div>• 0x01a0c000: {heapSizeKb - 32} KB chunk (Dynamic Task Nodes)</div>
                  </div>
                </div>
              )}
              {selectedSegment === 'data' && (
                <div className="space-y-1">
                  <p className="text-[11px] text-[var(--text-muted)] font-sans">
                    Global and static variables initialized at compilation:
                  </p>
                  <div className="text-[11px] space-y-0.5 text-blue-700 dark:text-blue-300">
                    <div>• <code className="font-mono">int g_scheduler_tick_count = {cycle};</code></div>
                    <div>• <code className="font-mono">char *g_kernel_version = "6.8.0-generic";</code></div>
                  </div>
                </div>
              )}
              {selectedSegment === 'text' && (
                <div className="space-y-1">
                  <p className="text-[11px] text-[var(--text-muted)] font-sans">
                    Machine instructions (Program Counter pointed line):
                  </p>
                  <div className="text-[11px] space-y-0.5 text-purple-700 dark:text-purple-300">
                    <div>• 0x{pc.toString(16)}: <span className="font-bold underline">movq %rax, -8(%rbp)</span> (Executing)</div>
                    <div>• 0x{(pc + 4).toString(16)}: callq 0x00401200 &lt;schedule&gt;</div>
                    <div>• 0x{(pc + 8).toString(16)}: nop</div>
                  </div>
                </div>
              )}
            </div>

            {/* Row 4: Open File Descriptors Table */}
            <div className="bg-[var(--bg-surface)] p-3 rounded border border-[var(--border-color)]">
              <div className="text-[11px] font-bold text-[var(--text-primary)] mb-1">
                Open File Descriptors Table (struct file* fd_array[256])
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-1 rounded bg-[var(--code-bg)]">0: <span className="text-[var(--text-muted)]">/dev/stdin</span></div>
                <div className="p-1 rounded bg-[var(--code-bg)]">1: <span className="text-[var(--text-muted)]">/dev/stdout</span></div>
                <div className="p-1 rounded bg-[var(--code-bg)]">2: <span className="text-[var(--text-muted)]">/dev/stderr</span></div>
                <div className="p-1 rounded bg-[var(--code-bg)]">3: <span className="text-[var(--accent-secondary)]">socket:tcp[8080]</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
