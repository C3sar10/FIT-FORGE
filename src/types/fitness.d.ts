// Types for fitness-specific metrics tracking
export interface FitnessMetric {
  id: string;
  userId: string;
  exerciseName: string;
  category: FitnessCategory;
  metricType: MetricType;
  value: number;
  unit: string;
  date: string;
  workoutLogId?: string; // Reference to workout log if from workout
  notes?: string;
}

export type FitnessCategory =
  | "strength"
  | "endurance"
  | "speed"
  | "balance"
  | "flexibility";

export type MetricType =
  | "max_weight" // 1RM, max bench press, etc.
  | "max_reps" // max pull-ups, push-ups, etc.
  | "time" // mile time, 5K time, plank hold
  | "distance" // max distance run/cycled
  | "flexibility" // reach distance, angle
  | "balance"; // hold time, stability score

export interface FitnessSummary {
  category: FitnessCategory;
  totalMetrics: number;
  recentImprovement: boolean;
  topExercises: {
    exerciseName: string;
    currentBest: number;
    unit: string;
    lastUpdated: string;
  }[];
}

export interface ExerciseProgress {
  exerciseName: string;
  category: FitnessCategory;
  metricType: MetricType;
  currentBest: number;
  previousBest?: number;
  unit: string;
  history: {
    date: string;
    value: number;
  }[];
  improvement: number; // percentage
  lastUpdated: string;
}

export interface FitnessChartData {
  date: string;
  value: number;
  exerciseName: string;
}
