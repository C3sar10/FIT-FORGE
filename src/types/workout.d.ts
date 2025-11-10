export interface WorkoutType {
  name: string;
  tags: string[];
  image?: string;
  id: string | null;
  description: string;
  author: string;
  type: string;
  isFavorite: boolean;
  blocks: [
    {
      title: string;
      items: WorkoutBlockItem[];
    }
  ];
}

export interface WorkoutBlockItem {
  name: string;
  exerciseId: string;
  sets: number;
  reps: string;
  restSecs: number;
}

export interface ExerciseType {
  author: string;
  description: string;
  details: {
    sets: number;
    reps?: string;
    restSecs?: number;
    // new details
    repType?: string;
    repNumber?: number;
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
    equipment: string[];
  };
  id: string;
  image: string;
  tags: string[];
  title: string;
  type: string;
}
