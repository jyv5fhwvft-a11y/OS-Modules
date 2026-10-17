export interface TermItem {
  term: string;
  definition: string;
}

export interface CohesionMatrix {
  reliesOn: string;
  feedsInto: string;
}

export interface LectureData {
  id: string;
  number: string;
  title: string;
  fullTitle: string;
  objective: string;
  prerequisites: string;
  analogyEveryday: {
    title: string;
    description: string;
  };
  analogyTechnical: {
    title: string;
    description: string;
  };
  cohesion: CohesionMatrix;
  coreBreakdown: string[];
  terms: TermItem[];
  codeExample: {
    title?: string;
    code: string;
    language: string;
    explanation?: string;
  };
  activity: {
    title: string;
    description: string;
  };
  mindmap: string;
  mindmapUrl: string;
  simulatorType?: 'pcb' | 'fork' | 'scheduler' | 'mlfq' | 'threads';
}

export interface LabData {
  id: string;
  title: string;
  target: string;
  description: string;
  gradingWeight: string;
}

export interface ProcessItem {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  remainingTime?: number;
  priority?: number;
  color: string;
}

export interface GanttBlock {
  processName: string;
  processColor: string;
  startTime: number;
  endTime: number;
  duration: number;
}
