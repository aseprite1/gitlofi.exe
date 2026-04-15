export interface ContributionDay {
  date: string;
  weekday: number;
  level: number;
  count: number;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface ContributionData {
  username: string;
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface SequencerPattern {
  rows: number;
  cols: number;
  grid: number[][];
}

export interface DrumInstrument {
  name: string;
  dayName: string;
  trigger: (velocity: number, time: number) => void;
  dispose: () => void;
}
