export interface ExerciseType {
  exerciseId: string;
  name: string;
  sets: Number;
  reps: string;
  restSecs: number;
  image?: string;
}

export interface WorkoutType {
  name: string;
  tags: string[];
  image?: string;
  id: string;
  description: string;
  author: string;
}

export interface ExerciseApiType {
  author: string;
  description: string;
  details: {
    sets: number;
    reps: string;
    restSecs: number;
    equipment: String[];
  };
  id: string;
  image: string;
  tags: string[];
  title: string;
  type: string;
}
