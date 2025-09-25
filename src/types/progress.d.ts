import { ExerciseApiType } from "./workout";

export interface WorkoutLogType {
  logId: string;
  userId: string;
  userName: string;
  title: string;
  createdOn: string;
  lastUpdated: string;
  description: string;
  workoutDetails: {
    workoutTimestamp: string;
    workoutTitle: string;
    workoutId: string;
    duration: string | number;
    exerciseList: ExerciseApiType[];
    exercisesCompleted: string[]; //ids of exercises completed in exerciseList
    type: string;
  };
  rating?: number;
  intensity?: number;
  notes?: string;
}
