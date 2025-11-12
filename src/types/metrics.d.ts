// Types for body metrics tracking
export interface MetricLogType {
  logId: string;
  userId: string;
  userName: string;
  date: string;
  createdAt: string;
  lastUpdated: string;
  metrics: {
    weight?: {
      value: number;
      unit: "kg" | "lbs";
    };
    bodyFat?: {
      value: number; // percentage
    };
    height?: {
      value: number;
      unit: "cm" | "ft" | "in";
    };
  };
  notes?: string;
}

export interface BMICalculation {
  bmi: number;
  category: "Underweight" | "Normal weight" | "Overweight" | "Obesity";
}

export interface MetricSummary {
  latestWeight?: {
    value: number;
    unit: "kg" | "lbs";
  };
  latestBodyFat?: number;
  latestHeight?: {
    value: number;
    unit: "cm" | "ft" | "in";
  };
  latestBMI?: BMICalculation;
  totalLogs: number;
}

export interface ChartDataPoint {
  date: string;
  weight?: number;
  bodyFat?: number;
  bmi?: number;
}
