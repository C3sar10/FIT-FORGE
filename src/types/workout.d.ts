export interface ExerciseType {
  exerciseId: string;
  name: string;
  sets: Number;
  reps: string;
  restSecs: number;
  image?: string;
  tags?: string[];
}

export interface WorkoutType {
  name: string;
  tags: string[];
  image?: string;
  id: string;
  description: string;
  author: string;
}

export interface WorkoutItem {
  name: String;
  sets: number;
  reps: String;
  restSecs: number;
}

export interface WorkoutApiType {
  name: string;
  tags: string[];
  image?: string;
  id: string;
  description: string;
  author: string;
  type: String;
  tags: String[];
  isFavorite: boolean;
  blocks: [
    {
      title: String;
      items: WorkoutItem[];
    }
  ];
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
