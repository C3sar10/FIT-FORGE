"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, Award, Target, Plus } from "lucide-react";
import { useTheme } from "next-themes";

// Mock data - in real app this would come from API
const strengthData = [
  { date: "Oct 1", bench: 185, squat: 225, deadlift: 275 },
  { date: "Oct 8", bench: 190, squat: 235, deadlift: 285 },
  { date: "Oct 15", bench: 185, squat: 240, deadlift: 290 },
  { date: "Oct 22", bench: 195, squat: 245, deadlift: 295 },
  { date: "Oct 29", bench: 200, squat: 250, deadlift: 305 },
  { date: "Nov 5", bench: 205, squat: 255, deadlift: 315 },
];

const exerciseStats = [
  {
    name: "Bench Press",
    current: "205 lbs",
    previous: "200 lbs",
    improvement: "+2.5%",
    trend: "up" as const,
  },
  {
    name: "Squat",
    current: "255 lbs",
    previous: "250 lbs",
    improvement: "+2.0%",
    trend: "up" as const,
  },
  {
    name: "Deadlift",
    current: "315 lbs",
    previous: "305 lbs",
    improvement: "+3.3%",
    trend: "up" as const,
  },
  {
    name: "Pull-ups",
    current: "12 reps",
    previous: "10 reps",
    improvement: "+20%",
    trend: "up" as const,
  },
  {
    name: "Push-ups",
    current: "45 reps",
    previous: "40 reps",
    improvement: "+12.5%",
    trend: "up" as const,
  },
  {
    name: "Overhead Press",
    current: "135 lbs",
    previous: "130 lbs",
    improvement: "+3.8%",
    trend: "down" as const,
  },
];

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
}) => {
  return (
    <div className="p-4 text-white bg-neutral-800 rounded-lg border border-neutral-700">
      <div className="flex items-center justify-between mb-2">
        <div className="text-neutral-500">{icon}</div>
        <div
          className={`flex items-center text-xs ${
            trend === "up"
              ? "text-green-600"
              : trend === "down"
              ? "text-red-600"
              : "text-neutral-500"
          }`}
        >
          <TrendingUp
            size={12}
            className={trend === "down" ? "rotate-180" : ""}
          />
          <span className="ml-1">{change}</span>
        </div>
      </div>
      <div className="mb-1">
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{title}</p>
    </div>
  );
};

interface ExerciseCardProps {
  exercise: (typeof exerciseStats)[0];
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  return (
    <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700 text-white hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{exercise.name}</h4>
        <div
          className={`flex items-center text-xs px-2 py-1 rounded-full ${
            exercise.trend === "up"
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          <TrendingUp
            size={10}
            //ignore lint
            className={exercise.trend === "down" ? "rotate-180" : ""}
          />
          <span className="ml-1">{exercise.improvement}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Current PR:
          </span>
          <div className="text-xl font-bold text-lime-600">
            {exercise.current}
          </div>
        </div>
        <div>
          <span className="text-sm text-neutral-500">
            Previous: {exercise.previous}
          </span>
        </div>
      </div>
    </div>
  );
};

const StrengthMetrics: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="w-full p-4 space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Volume (This Week)"
          value="12,450 lbs"
          change="+8.2%"
          trend="up"
          icon={<Award size={20} />}
        />
        <StatCard
          title="Personal Records"
          value="3"
          change="+1 this month"
          trend="up"
          icon={<Target size={20} />}
        />
        <StatCard
          title="Strength Score"
          value="847"
          change="+23 pts"
          trend="up"
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Progress Chart */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Strength Progress (Big 3)</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg text-sm">
            <Plus size={16} />
            Log PR
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={strengthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: "Weight (lbs)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === "dark" ? "#374151" : "#fff",
                border: `1px solid ${theme === "dark" ? "#6B7280" : "#E5E7EB"}`,
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="bench"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ fill: "#EF4444", r: 4 }}
              name="Bench Press"
            />
            <Line
              type="monotone"
              dataKey="squat"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: "#3B82F6", r: 4 }}
              name="Squat"
            />
            <Line
              type="monotone"
              dataKey="deadlift"
              stroke="#65A30D"
              strokeWidth={2}
              dot={{ fill: "#65A30D", r: 4 }}
              name="Deadlift"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Exercise Progress Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Exercise Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exerciseStats.map((exercise, index) => (
            <ExerciseCard key={index} exercise={exercise} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrengthMetrics;
