import { ExerciseType } from "./workout";

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
    workoutId: string;
    duration: string | number;
    exerciseList: ExerciseType[]; //list of exercises in the workout
    exercisesCompleted: string[]; //ids of exercises completed in exerciseList
    type: string;
  };
  rating?: number;
  intensity?: number;
  notes?: string;
}
