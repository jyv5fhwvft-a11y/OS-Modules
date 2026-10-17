import React, { useState, useMemo } from 'react';
import { Play, RotateCcw, Plus, Trash2, CheckCircle2, Info } from 'lucide-react';
import { ProcessItem, GanttBlock } from '../../types';

const INITIAL_PROCESSES: ProcessItem[] = [
  { id: '1', name: 'P1', arrivalTime: 0, burstTime: 24, color: '#3b82f6' },
  { id: '2', name: 'P2', arrivalTime: 0, burstTime: 3, color: '#10b981' },
  { id: '3', name: 'P3', arrivalTime: 0, burstTime: 3, color: '#f59e0b' },
];

export const CPUSchedulerSimulator: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'FCFS' | 'SJF' | 'RR'>('FCFS');
  const [timeQuantum, setTimeQuantum] = useState<number>(4);
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES);
  const [newProcName, setNewProcName] = useState('');
  const [newArrivalTime, setNewArrivalTime] = useState(0);
  const [newBurstTime, setNewBurstTime] = useState(4);

  // Load Presets
  const loadPreset = (preset: 'lecture' | 'convoy' | 'staggered') => {
    if (preset === 'lecture') {
      setProcesses([
        { id: '1', name: 'P1', arrivalTime: 0, burstTime: 24, color: '#3b82f6' },
        { id: '2', name: 'P2', arrivalTime: 0, burstTime: 3, color: '#10b981' },
        { id: '3', name: 'P3', arrivalTime: 0, burstTime: 3, color: '#f59e0b' },
      ]);
    } else if (preset === 'convoy') {
      setProcesses([
        { id: '1', name: 'P1', arrivalTime: 0, burstTime: 30, color: '#3b82f6' },
        { id: '2', name: 'P2', arrivalTime: 1, burstTime: 2, color: '#10b981' },
        { id: '3', name: 'P3', arrivalTime: 2, burstTime: 2, color: '#f59e0b' },
        { id: '4', name: 'P4', arrivalTime: 3, burstTime: 1, color: '#8b5cf6' },
      ]);
    } else {
      setProcesses([
        { id: '1', name: 'P1', arrivalTime: 0, burstTime: 7, color: '#3b82f6' },
        { id: '2', name: 'P2', arrivalTime: 2, burstTime: 4, color: '#10b981' },
        { id: '3', name: 'P3', arrivalTime: 4, burstTime: 1, color: '#f59e0b' },
        { id: '4', name: 'P4', arrivalTime: 5, burstTime: 4, color: '#8b5cf6' },
      ]);
    }
  };

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now().toString();
    const name = newProcName.trim() || `P${processes.length + 1}`;
    const colors = ['#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#14b8a6'];
    const color = colors[processes.length % colors.length];

    setProcesses([...processes, {
      id,
      name,
      arrivalTime: Math.max(0, Number(newArrivalTime) || 0),
      burstTime: Math.max(1, Number(newBurstTime) || 1),
      color
    }]);

    setNewProcName('');
    setNewBurstTime(4);
  };

  const handleRemoveProcess = (id: string) => {
    if (processes.length <= 1) return;
    setProcesses(processes.filter(p => p.id !== id));
  };

  // Compute Schedule & Metrics
  const { ganttChart, completedStats, avgWaitTime, avgTurnaroundTime, totalTime } = useMemo(() => {
    if (processes.length === 0) {
      return { ganttChart: [], completedStats: [], avgWaitTime: 0, avgTurnaroundTime: 0, totalTime: 0 };
    }

    const gantt: GanttBlock[] = [];
    const stats: Record<string, { completionTime: number; waitTime: number; turnaroundTime: number }> = {};
    let currentTime = 0;

    if (algorithm === 'FCFS') {
      const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
      for (const p of sorted) {
        if (currentTime < p.arrivalTime) {
          // CPU Idle gap
          gantt.push({
            processName: 'IDLE',
            processColor: '#78716c',
            startTime: currentTime,
            endTime: p.arrivalTime,
            duration: p.arrivalTime - currentTime,
          });
          currentTime = p.arrivalTime;
        }
        const start = currentTime;
        const end = currentTime + p.burstTime;
        gantt.push({
          processName: p.name,
          processColor: p.color,
          startTime: start,
          endTime: end,
          duration: p.burstTime,
        });
        currentTime = end;
        const turnaround = end - p.arrivalTime;
        const wait = turnaround - p.burstTime;
        stats[p.id] = { completionTime: end, waitTime: wait, turnaroundTime: turnaround };
      }
    } else if (algorithm === 'SJF') {
      // Non-preemptive Shortest Job First
      const remaining = [...processes].map(p => ({ ...p }));
      let completedCount = 0;

      while (completedCount < processes.length) {
        const available = remaining.filter(p => p.arrivalTime <= currentTime && p.burstTime > 0);
        if (available.length === 0) {
          const nextArrival = Math.min(...remaining.filter(p => p.burstTime > 0).map(p => p.arrivalTime));
          gantt.push({
            processName: 'IDLE',
            processColor: '#78716c',
            startTime: currentTime,
            endTime: nextArrival,
            duration: nextArrival - currentTime,
          });
          currentTime = nextArrival;
          continue;
        }

        // Pick shortest burst
        available.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
        const chosen = available[0];
        const start = currentTime;
        const end = currentTime + chosen.burstTime;

        gantt.push({
          processName: chosen.name,
          processColor: chosen.color,
          startTime: start,
          endTime: end,
          duration: chosen.burstTime,
        });

        currentTime = end;
        const turnaround = end - chosen.arrivalTime;
        const wait = turnaround - chosen.burstTime;
        stats[chosen.id] = { completionTime: end, waitTime: wait, turnaroundTime: turnaround };

        const target = remaining.find(p => p.id === chosen.id);
        if (target) target.burstTime = 0;
        completedCount++;
      }
    } else {
      // Round Robin
      const remaining = processes.map(p => ({ ...p, rem: p.burstTime }));
      const queue: typeof remaining = [];
      let i = 0;
      const sortedByArrival = [...remaining].sort((a, b) => a.arrivalTime - b.arrivalTime);

      // Add all arrived at time 0
      while (i < sortedByArrival.length && sortedByArrival[i].arrivalTime <= currentTime) {
        queue.push(sortedByArrival[i]);
        i++;
      }

      while (queue.length > 0 || i < sortedByArrival.length) {
        if (queue.length === 0) {
          const nextArrival = sortedByArrival[i].arrivalTime;
          gantt.push({
            processName: 'IDLE',
            processColor: '#78716c',
            startTime: currentTime,
            endTime: nextArrival,
            duration: nextArrival - currentTime,
          });
          currentTime = nextArrival;
          while (i < sortedByArrival.length && sortedByArrival[i].arrivalTime <= currentTime) {
            queue.push(sortedByArrival[i]);
            i++;
          }
          continue;
        }

        const current = queue.shift()!;
        const execTime = Math.min(current.rem, timeQuantum);
        const start = currentTime;
        const end = currentTime + execTime;

        gantt.push({
          processName: current.name,
          processColor: current.color,
          startTime: start,
          endTime: end,
          duration: execTime,
        });

        currentTime = end;
        current.rem -= execTime;

        // Enqueue any processes that arrived during this quantum
        while (i < sortedByArrival.length && sortedByArrival[i].arrivalTime <= currentTime) {
          queue.push(sortedByArrival[i]);
          i++;
        }

        // If current still has work, requeue
        if (current.rem > 0) {
          queue.push(current);
        } else {
          const turnaround = currentTime - current.arrivalTime;
          const wait = turnaround - current.burstTime;
          stats[current.id] = { completionTime: currentTime, waitTime: wait, turnaroundTime: turnaround };
        }
      }
    }

    const completedList = processes.map(p => ({
      ...p,
      completionTime: stats[p.id]?.completionTime ?? 0,
      waitTime: stats[p.id]?.waitTime ?? 0,
      turnaroundTime: stats[p.id]?.turnaroundTime ?? 0,
    }));

    const totalWait = completedList.reduce((acc, p) => acc + p.waitTime, 0);
    const totalTat = completedList.reduce((acc, p) => acc + p.turnaroundTime, 0);

    return {
      ganttChart: gantt,
      completedStats: completedList,
      avgWaitTime: Number((totalWait / processes.length).toFixed(2)),
      avgTurnaroundTime: Number((totalTat / processes.length).toFixed(2)),
      totalTime: currentTime,
    };
  }, [processes, algorithm, timeQuantum]);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-5 shadow-sm space-y-6">
      {/* Header and Algorithm Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h4 className="text-base font-bold text-[var(--accent-primary)] flex items-center gap-2">
            <span>⚙️</span> Interactive CPU Scheduling Engine (L07 / Lab 02)
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Evaluate preemptive and non-preemptive queue policies with live Gantt timeline rendering.
          </p>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--code-bg)] border border-[var(--border-color)] rounded-lg text-xs font-semibold">
          {(['FCFS', 'SJF', 'RR'] as const).map(algo => (
            <button
              key={algo}
              onClick={() => setAlgorithm(algo)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                algorithm === algo
                  ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {algo === 'FCFS' ? 'FCFS' : algo === 'SJF' ? 'SJF' : 'Round Robin'}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Buttons & Round Robin Quantum Slider */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--text-muted)]">Test Scenarios:</span>
          <button
            onClick={() => loadPreset('lecture')}
            className="px-2.5 py-1 rounded bg-[var(--chip-bg)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-colors"
          >
            L07 Gantt Example (P1:24, P2:3, P3:3)
          </button>
          <button
            onClick={() => loadPreset('convoy')}
            className="px-2.5 py-1 rounded bg-[var(--chip-bg)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-colors"
          >
            Convoy Effect Test
          </button>
          <button
            onClick={() => loadPreset('staggered')}
            className="px-2.5 py-1 rounded bg-[var(--chip-bg)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-colors"
          >
            Staggered Arrivals
          </button>
        </div>

        {algorithm === 'RR' && (
          <div className="flex items-center gap-2 bg-[var(--accent-secondary-bg)] px-3 py-1.5 rounded-md border border-[var(--accent-secondary)]">
            <span className="font-semibold text-[var(--accent-secondary)]">Time Quantum (q):</span>
            <input
              type="range"
              min="1"
              max="10"
              value={timeQuantum}
              onChange={e => setTimeQuantum(Number(e.target.value))}
              className="w-24 cursor-pointer"
            />
            <span className="font-mono font-bold text-[var(--accent-secondary)] text-sm">{timeQuantum} ms</span>
          </div>
        )}
      </div>

      {/* Gantt Chart Visualizer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
          <span>Gantt Chart Timeline (Total Time: {totalTime} ms)</span>
          <span className="font-mono">Policy: {algorithm}</span>
        </div>

        {/* Gantt Bar */}
        <div className="w-full bg-[var(--code-bg)] border border-[var(--border-color)] rounded-lg p-2.5 overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="flex h-12 w-full rounded border border-[var(--border-color)] overflow-hidden shadow-inner">
              {ganttChart.map((block, idx) => {
                const widthPercent = totalTime > 0 ? (block.duration / totalTime) * 100 : 0;
                return (
                  <div
                    key={idx}
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: block.processColor,
                    }}
                    className="h-full flex items-center justify-center text-white font-mono text-xs font-bold transition-all relative border-r border-black/20 group cursor-default"
                    title={`${block.processName}: [${block.startTime}ms → ${block.endTime}ms]`}
                  >
                    <span className="truncate px-1">{block.processName}</span>
                    <span className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black/85 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-20">
                      {block.startTime}ms - {block.endTime}ms ({block.duration}ms)
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time Markings */}
            <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)] mt-1.5 px-0.5">
              <span>0 ms</span>
              {ganttChart.map((block, idx) => (
                <span key={idx} style={{ textAlign: 'right' }}>
                  {block.endTime} ms
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[var(--code-bg)] p-3.5 rounded-lg border border-[var(--border-color)]">
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-surface)] rounded border border-[var(--border-color)]">
          <div className="text-xs">
            <div className="text-[var(--text-muted)]">Average Wait Time (T_wait)</div>
            <div className="text-[11px] text-[var(--text-muted)] font-mono">Σ(T_turnaround - T_burst) / N</div>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--accent-primary)]">
            {avgWaitTime} <span className="text-xs font-normal">ms</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-surface)] rounded border border-[var(--border-color)]">
          <div className="text-xs">
            <div className="text-[var(--text-muted)]">Average Turnaround Time (T_tat)</div>
            <div className="text-[11px] text-[var(--text-muted)] font-mono">Σ(T_completion - T_arrival) / N</div>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--accent-secondary)]">
            {avgTurnaroundTime} <span className="text-xs font-normal">ms</span>
          </div>
        </div>
      </div>

      {/* Processes Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--text-primary)]">Process Queue & Calculated Vectors</span>
          <span className="text-[var(--text-muted)]">{completedStats.length} processes registered</span>
        </div>

        <div className="overflow-x-auto border border-[var(--border-color)] rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[var(--code-bg)] text-[var(--text-muted)] border-b border-[var(--border-color)]">
              <tr>
                <th className="py-2.5 px-3">Process</th>
                <th className="py-2.5 px-3">Arrival</th>
                <th className="py-2.5 px-3">Burst</th>
                <th className="py-2.5 px-3">Completion</th>
                <th className="py-2.5 px-3">Turnaround</th>
                <th className="py-2.5 px-3">Wait Time</th>
                <th className="py-2.5 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] bg-[var(--bg-surface)]">
              {completedStats.map(p => (
                <tr key={p.id} className="hover:bg-[var(--code-bg)] transition-colors">
                  <td className="py-2 px-3 font-bold flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: p.color }}
                    />
                    {p.name}
                  </td>
                  <td className="py-2 px-3">{p.arrivalTime} ms</td>
                  <td className="py-2 px-3">{p.burstTime} ms</td>
                  <td className="py-2 px-3 font-semibold">{p.completionTime} ms</td>
                  <td className="py-2 px-3 text-[var(--accent-secondary)]">{p.turnaroundTime} ms</td>
                  <td className="py-2 px-3 text-[var(--accent-primary)] font-bold">{p.waitTime} ms</td>
                  <td className="py-2 px-2 text-right">
                    <button
                      onClick={() => handleRemoveProcess(p.id)}
                      disabled={processes.length <= 1}
                      className="text-stone-400 hover:text-red-500 disabled:opacity-30 transition-colors p-1"
                      title="Remove process"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Process Form */}
      <form onSubmit={handleAddProcess} className="flex flex-wrap items-end gap-2 pt-2 border-t border-[var(--border-color)]">
        <div>
          <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">Name</label>
          <input
            type="text"
            placeholder={`P${processes.length + 1}`}
            value={newProcName}
            onChange={e => setNewProcName(e.target.value)}
            className="w-20 px-2 py-1.5 text-xs bg-[var(--bg-page)] border border-[var(--border-color)] rounded focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">Arrival (ms)</label>
          <input
            type="number"
            min="0"
            value={newArrivalTime}
            onChange={e => setNewArrivalTime(Number(e.target.value))}
            className="w-24 px-2 py-1.5 text-xs bg-[var(--bg-page)] border border-[var(--border-color)] rounded focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">Burst (ms)</label>
          <input
            type="number"
            min="1"
            value={newBurstTime}
            onChange={e => setNewBurstTime(Number(e.target.value))}
            className="w-24 px-2 py-1.5 text-xs bg-[var(--bg-page)] border border-[var(--border-color)] rounded focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold rounded transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Task
        </button>
      </form>
    </div>
  );
};
