export interface WorkoutType {
  name: string;
  tags: string[];
  image?: string;
  id: string;
  description: string;
  author: string;
  type: string;
  tags: string[];
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
