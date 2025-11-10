import { ExerciseType, WorkoutBlockItem } from "./workout";

// New type for tracking individual set performance
export interface SetPerformance {
  setNumber: number;
  reps: number;
  weight?: number; // Optional - not all exercises use weight
  restTime?: number; // Actual rest time taken in seconds
  completed: boolean;
  notes?: string; // Optional notes for the set
}

// Enhanced exercise log entry for detailed workout tracking
export interface ExerciseLogEntry {
  exerciseId: string;
  name: string;
  // Planned values from workout/exercise
  plannedSets: number;
  plannedReps: number | string; // Could be "6-10" or specific number
  plannedRestSecs?: number;
  // Actual performance data
  actualSets: SetPerformance[];
  completed: boolean;
  notes?: string;
  // Timestamps for tracking
  startTime?: string;
  endTime?: string;
}

export interface WorkoutLogType {
  logId: string;
  userId: string;
  userName: string;
  title: string;
  workoutDate?: string;
  createdOn: string;
  lastUpdated: string;
  description: string;
  workoutDetails: {
    workoutTimestamp: string;
    workoutTitle: string;
    workoutId: string | null;
    duration: string | number;
    exerciseList: ExerciseLogEntry[]; // Updated to use enhanced tracking
    exercisesCompleted: string[]; // Keep for backward compatibility
    type: string;
  };
  rating?: number;
  intensity?: number;
  notes?: string;
  schemaVersion?: number; // Add versioning for migration support
}
