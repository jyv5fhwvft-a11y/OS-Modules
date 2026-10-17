import { LectureData, LabData } from '../types';

export const CURRICULUM_LECTURES: LectureData[] = [
  {
    id: 'lecture-05',
    number: '05',
    title: 'L05: Process Anatomy & PCB',
    fullTitle: 'Lecture 05: Process Anatomy & The PCB Ledger',
    objective: 'Diagram the internal memory layout of a process and define every tracking metric stored inside the Process Control Block (PCB) kernel ledger.',
    prerequisites: 'Module 1 (All Lectures), C memory layout concepts (Stack vs. Heap).',
    analogyEveryday: {
      title: 'The Business Corporate Accountant',
      description: 'Imagine a massive corporate office building where multiple completely different businesses (User Processes) share the same workspace. Each business thinks it is the only company there. To keep them organized, the building manager has a dedicated filing cabinet containing a thick ledger folder for every single business. This folder is the Process Control Block (PCB). Inside it, the manager writes down exactly how much money the business has (Registers), which office doors they have keys to (File Descriptors), and exactly what line of their contract they are currently reading (Program Counter). If a business leaves the room, the accountant reads this ledger to restore their exact state when they return.'
    },
    analogyTechnical: {
      title: 'Virtual Machine Configuration & Saved-State Snapshot',
      description: 'A process layout matches a sandboxed virtual container, where the underlying host kernel preserves a structured C struct (struct task_struct in Linux) to cache metadata boundaries that hardware registers must shift into during a context switch.'
    },
    cohesion: {
      reliesOn: 'L02 (Dual-Mode Barrier) — Relies on Ring 0 privileges to protect the PCB arrays from being altered by unprivileged user application code.',
      feedsInto: 'L06 (Execution Mechanics) — Modifying, cloning, or discarding a process lifecycle requires allocating or freeing a physical PCB block struct inside the kernel slab allocator.'
    },
    coreBreakdown: [
      'A process is a program in execution. It consists of more than just static machine code; it encompasses an active address space split into distinct regions: the Text Segment (compiled machine instructions), the Data Segment (global variables), the Heap (dynamically allocated memory), and the Stack (local variables and function parameters).',
      'To manage these active entities, the kernel maintains an array of Process Control Blocks. The PCB tracks vital metadata: Process ID (PID), Process State (Ready, Running, Blocked), Program Counter (PC register), CPU Register saves, Memory Management boundaries, and Open File Descriptor tables.'
    ],
    terms: [
      {
        term: 'Process',
        definition: 'An active instance of a running software application containing its own dedicated execution context and address boundaries.'
      },
      {
        term: 'Process Control Block (PCB)',
        definition: 'The definitive kernel data structure used to track, schedule, and preserve a process\'s metadata.'
      },
      {
        term: 'Program Counter (PC)',
        definition: 'A specialized physical CPU register that stores the memory address of the next instruction waiting to be executed.'
      },
      {
        term: 'Process States',
        definition: 'The operational lifecycle flag of a task (New, Ready, Running, Waiting/Blocked, Terminated).'
      }
    ],
    codeExample: {
      title: 'Conceptual kernel representation of a Process Control Block ledger entry',
      language: 'c',
      code: `// Conceptual kernel representation of a Process Control Block ledger entry
struct ProcessControlBlock {
    int pid;                        // Unique Process Identifier
    enum { READY, RUNNING, BLOCKED } state; // Current lifecycle tracker
    unsigned long program_counter;  // Pointer to current assembly line
    unsigned long registers[16];   // Array cache to save CPU state
    int open_files_map[256];        // File descriptor mapping layout
};`
    },
    activity: {
      title: 'The Human PCB Blueprint Map',
      description: 'Draw a massive empty process memory map (Text, Data, Heap, Stack) on the classroom chalkboard. Hand four different students cards labeled "Global Int Variable," "Compiled Printf Instruction," "Malloc Address Pointer," and "Local Function Loop Index." Have them physically walk up to the board and stand in the exact segment zone where their asset belongs in a running process.'
    },
    mindmap: `CS 301: Operating Systems
  └── Module 2: Process Management
        └── L05: Process Anatomy
              └── Memory Segments & The PCB Struct`,
    mindmapUrl: 'https://your-github-username.github.io/os-mindmap/index.html',
    simulatorType: 'pcb'
  },
  {
    id: 'lecture-06',
    number: '06',
    title: 'L06: Execution Mechanics',
    fullTitle: 'Lecture 06: Process Execution Mechanics (fork, exec, Context Switch)',
    objective: 'Explain the exact operational lifecycle difference between cloning an address space (fork) and overriding an address space (exec), and trace register states during a context switch.',
    prerequisites: 'L03 (Syscall Interface), L05 (Process Anatomy).',
    analogyEveryday: {
      title: 'Swapping Runners Mid-Relay',
      description: 'Imagine a track-and-field relay race. Executing a fork() system call is like the current runner magically duplicating themselves into a perfect clone runner standing right next to them; both clones have the exact same muscle memory, are running at the exact same speed, and are looking at the exact same spot on the track. Executing an exec() call is like that runner keeping their physical body but instantly handing them an entirely new task script (e.g., throwing a javelin instead of running). A Context Switch is the referee pausing the race, carefully writing down exactly where the current runner stood on the track, making them step aside, and letting the next runner onto the track based on their previously recorded track position ledger.'
    },
    analogyTechnical: {
      title: 'Git Branching vs. Project Overwriting',
      description: 'A fork() system call is identical to a git branch command—it duplicates the exact state of the commit timeline into an isolated copy. An exec() system call is identical to deleting all code files inside a folder and cloning a completely different repository into that exact same directory path.'
    },
    cohesion: {
      reliesOn: 'L03 (Gatekeeper Mechanism) — Relies on system traps to pass execution control securely to sys_fork and sys_execve routines.',
      feedsInto: 'Module 4 (Memory Management) — Deeply ties into Virtual Memory optimization mechanisms like Copy-On-Write (COW) page table mirroring.'
    },
    coreBreakdown: [
      'In Unix-like systems, new processes are created via a two-step mechanism. The fork() system call clones the calling process, creating an identical child process. The child receives a unique PID, but copies the parent\'s file descriptors, environment, and address space. Crucially, fork() returns 0 inside the child process, but returns the child\'s real PID inside the parent process, allowing code to branch.',
      'The exec() family of calls overrides the current process image, wiping the stack, heap, and data segments to load a brand new executable binary file. A Context Switch occurs when the kernel scheduler shifts the CPU core from executing one process to another, requiring saving the active CPU registers into the outgoing process\'s PCB and restoring the register values from the incoming process\'s PCB.'
    ],
    terms: [
      {
        term: 'fork()',
        definition: 'A system call that duplicates the current process to create an isolated, matching child process container.'
      },
      {
        term: 'exec()',
        definition: 'A system call that overrides the active process address space with a new executable binary program image.'
      },
      {
        term: 'Context Switch',
        definition: 'The physical hardware/software process of saving the active CPU register state and restoring a different task context.'
      },
      {
        term: 'PCB Save/Restore',
        definition: 'The computational steps during a context switch that copy registers to or from a task\'s PCB kernel cache.'
      }
    ],
    codeExample: {
      title: 'Classic Unix fork-and-exec shell launching pattern',
      language: 'c',
      code: `// Classic Unix fork-and-exec shell launching pattern
#include <unistd.h>
#include <sys/types.h>
#include <stdio.h>

int main() {
    pid_t rc = fork(); // Clones the process!
    if (rc < 0) {
        fprintf(stderr, "Fork failed\\n");
    } else if (rc == 0) {
        // Child process execution path
        printf("Child process (PID: %d) launching 'ls' command...\\n", getpid());
        char *args[] = {"/bin/ls", "-l", NULL};
        execv(args[0], args); // Overrides address space completely!
        printf("This line will NEVER print unless exec fails!");
    } else {
        // Parent process execution path
        wait(NULL); // Wait for the child runner to finish its task
        printf("Parent process resumed execution line securely.\\n");
    }
    return 0;
}`
    },
    activity: {
      title: 'The Live C Code Output Prediction Game',
      description: 'Type up a basic C file containing a nested loop and a raw fork() call on the projector screen. Before compiling or running it, pass sheets of paper out to students. Have them trace the execution timeline and predict the exact line-by-line terminal output layout. Run it live to see who predicted the overlapping interleaved child-parent print arrays correctly.'
    },
    mindmap: `CS 301: Operating Systems
  └── Module 2: Process Management
        └── L06: Execution Mechanics
              └── fork() Cloning vs exec() Overriding → The Context Switch Tax`,
    mindmapUrl: 'https://your-github-username.github.io/os-mindmap/index.html',
    simulatorType: 'fork'
  },
  {
    id: 'lecture-07',
    number: '07',
    title: 'L07: CPU Scheduling I',
    fullTitle: 'Lecture 07: CPU Scheduling I (Non-Preemptive vs. Preemptive Foundations)',
    objective: 'Manually compute turn-around time, response time, and average wait metrics for a given array of task vectors under FCFS, SJF, and Round Robin scheduling algorithms.',
    prerequisites: 'L05, L06, basic arithmetic.',
    analogyEveryday: {
      title: 'The Grocery Store Checkout Line',
      description: 'Imagine a grocery store checkout lane with one single cashier (The CPU Core). First-Come-First-Served (FCFS) means checking people out based on when they joined the line; if a person with a massive cart full of items stands in front, a person buying a single pack of gum is trapped waiting forever (Convoy Effect). Shortest-Job-First (SJF) means sorting the line so the person with the single pack of gum goes first; this minimizes average wait times, but requires magically predicting how long someone will take to pay. Round Robin (RR) means the cashier spends exactly 30 seconds processing a customer\'s items, and if they aren\'t done, they are forced to walk to the very back of the line to wait for their next timed turn (Time Quantum fairness).'
    },
    analogyTechnical: {
      title: 'Network Packet Routing Ring Buffers',
      description: 'Scheduling policies match algorithmic traffic-shaping configurations inside local area network routers, sorting whether data frame chunks are dispatched via sequential queues, size metric predictions, or strict time-sliced round-robin rotations.'
    },
    cohesion: {
      reliesOn: 'L06 (Context Switch Mechanics) — Round Robin requires firing hardware clock timer interrupts to force a context switch when a thread\'s time slice expires.',
      feedsInto: 'L08 (Advanced Scheduling) — Forms the essential mathematical foundation needed to analyze Multi-Level Feedback Queues.'
    },
    coreBreakdown: [
      'The CPU scheduler decides which process in the READY state gets to slide onto an active processor core next.',
      'FCFS is non-preemptive and algorithmically trivial but suffers from the Convoy Effect (short jobs trapped behind long jobs).',
      'SJF minimizes average wait times but can cause starvation for large processes if small tasks constantly arrive.',
      'Round Robin introduces preemption using a Time Quantum (a microsecond scheduling slice). If the quantum is configured too large, Round Robin degrades into simple FCFS; if configured too small, the system burns excessive CPU cycles on context-switching overhead instead of real program execution.'
    ],
    terms: [
      {
        term: 'Preemption',
        definition: 'The ability of an operating system to forcefully pause a running process to hand the CPU core to a different task.'
      },
      {
        term: 'Time Quantum',
        definition: 'The maximum continuous block of time a thread is permitted to run under a preemptive scheduling policy before being context-switched.'
      },
      {
        term: 'Convoy Effect',
        definition: 'A system slowdown scenario where short processes wait a prolonged duration for a long, heavy process to vacate the CPU core.'
      },
      {
        term: 'Average Wait Time',
        definition: 'The arithmetic mean of the total time processes spent sitting inside the READY queue waiting for execution access.'
      }
    ],
    codeExample: {
      title: 'Gantt Chart Derivation Exercise',
      language: 'text',
      code: `Gantt Chart Derivation Exercise: Given three processes arriving at time 0: P1 (Burst Time = 24), P2 (Burst Time = 3), P3 (Burst Time = 3).
Under FCFS, the scheduling order is P1 → P2 → P3. Wait times are P1 = 0, P2 = 24, P3 = 27. Average Wait Time = (0 + 24 + 27) / 3 = 17ms.
Under SJF, the scheduling order is P2 → P3 → P1. Wait times are P2 = 0, P3 = 3, P1 = 6. Average Wait Time = (0 + 3 + 6) / 3 = 3ms. (Demonstrates the radical optimization efficiency of shortest-job prioritization).`
    },
    activity: {
      title: 'The Physical Checkout Lane Simulation',
      description: 'Line up five students at the front of the classroom. Assign them slips of paper detailing a technical task complexity weight (e.g., writing 2 sentences vs. writing 10 sentences on the board). Run the line live using FCFS first, then sort them by SJF, and finally run them with a 15-second Round Robin timer to physically map out how waiting metrics fluctuate for the students.'
    },
    mindmap: `CS 301: Operating Systems
  └── Module 2: Process Management
        └── L07: CPU Scheduling I
              └── Policies (FCFS, SJF, Round Robin) → Metrics (Wait, Turnaround)`,
    mindmapUrl: 'https://your-github-username.github.io/os-mindmap/index.html',
    simulatorType: 'scheduler'
  },
  {
    id: 'lecture-08',
    number: '08',
    title: 'L08: CPU Scheduling II',
    fullTitle: 'Lecture 08: CPU Scheduling II (Advanced Multi-Level Feedback Queues & Edge Cases)',
    objective: 'Construct a priority starvation scenario, calculate priority aging fixes, and diagnose the architectural trap of Priority Inversion.',
    prerequisites: 'L07 (CPU Scheduling I).',
    analogyEveryday: {
      title: 'The Hospital Emergency Room Waiting Area',
      description: 'Imagine a hospital emergency room. A standard "first come first served" policy completely collapses the second an ambulance pulls up carrying someone bleeding out from an accident (Priority Scheduling). However, if the ER doctors only look at high-priority critical emergencies, a person sitting in the corner with a fractured arm might sit in the lobby waiting for three consecutive days without ever seeing a physician (Starvation). To solve this, the triage nurse uses Aging—every hour the patient sits in the waiting room, their priority level is boosted slightly until they eventually become the top-priority emergency.'
    },
    analogyTechnical: {
      title: 'High-Bandwidth Audio Buffering vs. Background Indexing',
      description: 'Advanced scheduling behaves identically to a media system packet network, routing a critical 4K live audio sample array ahead of a background backup agent daemon, while dynamically penalizing the background agent\'s scheduling frequency bounds to prevent UI lockups.'
    },
    cohesion: {
      reliesOn: 'L07 (Scheduling Policies) — Builds upon basic queue structures by linking multiple preemptive tiers together.',
      feedsInto: 'Module 5 (Process Synchronization) — Directly interacts with locking mechanics, where priority configurations can cause a low-priority thread holding a lock to block a high-priority thread (Priority Inversion).'
    },
    coreBreakdown: [
      'Pure priority scheduling assigns every process a numeric value, always picking the task with the highest rating. This easily causes Starvation (low-priority jobs never execute). To resolve this without manual tuning, modern kernels utilize a Multi-Level Feedback Queue (MLFQ).',
      'MLFQ structures multiple distinct ready lines, each with varying priority tiers and time quantums. New tasks enter the top-tier queue with a short quantum. If they consume their entire time slice without yielding, MLFQ downgrades them to a lower-tier line with a longer quantum. This dynamically separates quick, interactive, I/O-bound tasks from heavy, compute-bound background batch jobs.'
    ],
    terms: [
      {
        term: 'Starvation',
        definition: 'A scheduling defect where a process remains indefinitely delayed inside the ready state because higher-priority tasks keep seizing control.'
      },
      {
        term: 'Aging',
        definition: 'A kernel mitigation technique that gradually elevates a process\'s scheduling priority the longer it sits starved inside the ready queue.'
      },
      {
        term: 'Multi-Level Feedback Queue (MLFQ)',
        definition: 'An adaptive CPU scheduling architecture that shifts tasks dynamically between historical execution runtime rows.'
      },
      {
        term: 'Priority Inversion',
        definition: 'An operational trap where a low-priority thread holding a resource indirectly delays a high-priority thread due to an intermediate medium-priority thread preempting the resource holder.'
      }
    ],
    codeExample: {
      title: 'The Priority Inversion Scenario (The Mars Pathfinder Glitch Case Study)',
      language: 'text',
      code: `The Priority Inversion Scenario (The Mars Pathfinder Glitch Case Study): High-priority task TH requires a shared lock held by low-priority task TL. Suddenly, a medium-priority task TM arrives that does not require the lock. TM preempts TL because its base priority rating is higher. Consequently, TL cannot run to finish its task and release the lock, which indefinitely traps the high-priority task TH from running. (Fixed using Priority Inheritance, where TL temporarily inherits the priority level of TH to rush out of the critical section).`
    },
    activity: {
      title: 'The Mars Pathfinder Trap Roleplay',
      description: 'Appoint three students as TH (High Priority), TM (Medium Priority), and TL (Low Priority). Hand TL an item representing a locked resource (like a dry-erase marker). Run the execution simulation on the board to visually demonstrate to the class how TM can accidentally paralyze the system, and have students propose a solution before you name Priority Inheritance.'
    },
    mindmap: `CS 301: Operating Systems
  └── Module 2: Process Management
        └── L08: CPU Scheduling II
              └── Starvation Mitigation → MLFQ Logic → Priority Inversion Traps`,
    mindmapUrl: 'https://your-github-username.github.io/os-mindmap/index.html',
    simulatorType: 'mlfq'
  },
  {
    id: 'lecture-09',
    number: '09',
    title: 'L09: Threads & Concurrency',
    fullTitle: 'Lecture 09: Threads & Concurrency Models',
    objective: 'Contrast the architectural memory boundaries of independent processes against concurrent threads, and delineate Many-to-One, One-to-One, and Many-to-Many scheduling architectures.',
    prerequisites: 'L05, L06.',
    analogyEveryday: {
      title: 'Stage Actors sharing a single Props Table',
      description: 'Imagine a theatrical play. A Process is an entire independent stage production running in its own auditorium building. If you want two separate processes to coordinate, they have to physically mail letters across town (Inter-Process Communication). A Thread is like hiring multiple separate actors (Execution Points) to step onto the same stage inside the same building. They each have their own script folder (Thread Stack) and perform actions independently, but they all share the exact same props table, background scenery, and storage crates (Shared Address Space/Heap). If one actor knocks over the shared props table, every single actor is impacted immediately.'
    },
    analogyTechnical: {
      title: 'Independent Browser Windows vs. Isolated Tabs within a Web Engine',
      description: 'Multiple processes match running a standalone text editor alongside a standalone video game. Threads match opening multiple tabs inside a modern web browser instance, where every tab shares a pool of background caching memory.'
    },
    cohesion: {
      reliesOn: 'L05 (Process Anatomy) — Threads reuse the parent process\'s Data, Text, and Heap boundaries while requiring their own independent Stack frames.',
      feedsInto: 'Module 3 (Memory Management) — Shared memory models mean threads directly point to overlapping virtual page addresses, which serves as the essential core driver for Module 4 Process Synchronization.'
    },
    coreBreakdown: [
      'A thread is the fundamental lightweight unit of CPU utilization. Unlike processes, which maintain absolute isolation, threads belonging to the same process share their Code segment, Data segment, and Operating System resources (like open files). However, every individual thread must possess its own unique Thread ID, Program Counter, register state cache, and isolated Stack frame to track private function execution paths.',
      'In the Many-to-One model, multiple user threads map to a single kernel thread context; thread switching is incredibly fast, but if one user thread blocks on I/O, the entire process freezes. The One-to-One model (used by modern Linux and Windows) maps every individual user thread directly to its own scheduled kernel thread, unlocking true parallel processing across multi-core chips.'
    ],
    terms: [
      {
        term: 'Thread',
        definition: 'A lightweight concurrent sequence of instructions executing within the shared ecosystem context of a parent process.'
      },
      {
        term: 'User-Level Thread',
        definition: 'A thread managed completely in user space by an app library without the underlying kernel core being aware of its boundaries.'
      },
      {
        term: 'Kernel-Level Thread',
        definition: 'A thread maintained, tracked, and scheduled natively by the operating system core within Ring 0.'
      },
      {
        term: 'Concurrency',
        definition: 'Enabling multiple execution paths to make progress over overlapping blocks of time (via fast time-slicing or true parallel cores).'
      }
    ],
    codeExample: {
      title: 'Compiling a multi-threaded execution application using POSIX pthreads',
      language: 'c',
      code: `// Compiling a multi-threaded execution application using POSIX pthreads
#include <pthread.h>
#include <stdio.h>

void* thread_runner_routine(void* arg) {
    printf("Hello from concurrent Thread ID: %ld! We share the same Heap/Data.\\n", pthread_self());
    return NULL;
}

int main() {
    pthread_t worker_thread_id;
    printf("Main parent thread spawning lightweight worker...\\n");
    // Spin up an independent concurrent instruction thread
    pthread_create(&worker_thread_id, NULL, thread_runner_routine, NULL);
    // Main thread waits for the concurrent sibling worker to finish its run
    pthread_join(worker_thread_id, NULL);
    printf("Worker finished. Main thread exit routine finalized.\\n");
    return 0;
}`
    },
    activity: {
      title: 'The Task Manager Thread Inspection Hunt',
      description: 'Have all students pull up their laptops. Instruct Windows users to open Task Manager and turn on the "Threads" column header view. Instruct Mac/Linux users to open Activity Monitor or run htop. Have them locate a heavy app instance like a web browser or communication client, note that it uses 1 or 2 core processes, but expand it to reveal the dozens of active concurrent threads running inside that single container space.'
    },
    mindmap: `CS 301: Operating Systems
  └── Module 2: Process Management
        └── L09: Threads & Concurrency Models
              └── Shared Spaces (Heap/Data) vs Private Spaces (Stacks) → 1:1 Mapping`,
    mindmapUrl: 'https://your-github-username.github.io/os-mindmap/index.html',
    simulatorType: 'threads'
  }
];

export const LAB_02_DATA: LabData = {
  id: 'lab-02',
  title: 'Lab 02: CPU Scheduling & Benchmarking Simulators',
  target: 'Lab 2: CPU Scheduling & Benchmarking Simulators',
  description: 'Students implement a lightweight C program that models task arrival vectors. They code functional modules simulating First-Come-First-Served (FCFS) and a round-robin time-sliced scheduling wheel. The simulator must output turnaround and wait time averages for verification.',
  gradingWeight: 'Core metric code scripts run through automated verification arrays (Counts toward the 45% Lab block).'
};
