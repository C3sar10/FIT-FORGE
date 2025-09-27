export type EventType = "workout" | "log";

export interface Event {
  id: string;
  author: string;
  title: string;
  type: EventType;
  date: string; // ISO string
  workoutDetails?: {
    workoutId?: string;
    name?: string;
    notes?: string;
    image?: string;
  };
  logDetails?: {
    logId?: string;
    summary?: string;
    notes?: string;
  };
  tags?: string[];
  description?: string;
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
