import { ExerciseType, WorkoutType } from "@/types/workout";

export const randomFive = ({ list }: { list: any[] }) => {
  // verify there is at least five items in the list
  if (list.length < 5) {
    throw new Error("List must contain at least five items");
  }
  const shuffled = list.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
};

export const randomFiveWorkouts = ({ list }: { list: WorkoutType[] }) => {
  return randomFive({ list });
};

export const randomFiveExercises = ({ list }: { list: ExerciseType[] }) => {
  return randomFive({ list });
};

// get weekdates from a given date
export function getWeekDates(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

// Helper to get all days in the week of the selected date
export const getWeekDatesForSelected = (selected: Date | undefined) => {
  if (!selected) return [];
  const start = new Date(selected);
  start.setDate(selected.getDate() - selected.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};
