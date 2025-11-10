export interface WorkoutType {
  _id?: string;
  userId?: string;
  author?: string;
  name: string;
  description?: string;
  image?: string;
  type: "strength" | "endurance" | "sport" | "speed" | "other" | string;
  tags: string[];
  isFavorite?: boolean;
  blocks: Array<{
    title?: string;
    items: WorkoutBlockItem[];
  }>;
  schemaVersion?: number;
  createdAt?: string;
  updatedAt?: string;
  // Legacy support for existing code
  id?: string | null;
}

// Shared RepObj interface for both workouts and exercises
export interface RepObjType {
  repType?:
    | "number"
    | "duration"
    | "distance"
    | "time"
    | "repRange"
    | "timeRange"
    | "other"
    | string;
  repNumber?: number | null;
  repRange?: { min: number | null; max: number | null };
  timeRange?: {
    min: { time: number | null; unit: string | null };
    max: { time: number | null; unit: string | null };
  };
  repDuration?: { time: number | null; unit: string | null };
  repDistance?: { distance: number | null; unit: string | null };
  restTimeSets?: { time: number | null; unit: string | null };
  restTimeReps?: { time: number | null; unit: string | null };
  targetMetric?: {
    type: string | null;
    unit: string | null;
    number: number | null;
    name: string | null;
  };
  equipment?: string[];
}

export interface WorkoutBlockItem {
  name?: string;
  exerciseId: string;
  sets?: number;
  reps?: number | string | null;
  restSecs?: number;
  repObj?: RepObjType;
}

export interface ExerciseType {
  _id?: string;
  author?: string;
  title?: string;
  type?: "strength" | "endurance" | "sport" | "speed" | "other" | string;
  tags?: string[];
  description?: string;
  image?: string | null;
  demoUrl?: string;
  details?: RepObjType & {
    sets?: number;
    reps?: number | string | null;
    restSecs?: number;
  };
  schemaVersion?: number;
  createdAt?: string;
  updatedAt?: string;
  // Legacy support for existing code
  id: string;
}
