export interface ExerciseType {
  exerciseId: string;
  name: string;
  sets: Number;
  reps: string;
  restSecs: number;
}

export interface WorkoutType {
  name: string;
  tags: string[];
  image?: string;
  id: string;
  description: string;
  author: string;
}
