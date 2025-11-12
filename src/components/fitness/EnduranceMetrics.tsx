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
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, Timer, Heart, Plus } from "lucide-react";
import { useTheme } from "next-themes";

// Mock data for endurance metrics
const enduranceData = [
  { date: "Oct 1", vo2Max: 45, restingHR: 65, maxDistance: 5.2 },
  { date: "Oct 8", vo2Max: 46, restingHR: 63, maxDistance: 6.1 },
  { date: "Oct 15", vo2Max: 47, restingHR: 62, maxDistance: 6.8 },
  { date: "Oct 22", vo2Max: 48, restingHR: 61, maxDistance: 7.5 },
  { date: "Oct 29", vo2Max: 49, restingHR: 60, maxDistance: 8.2 },
  { date: "Nov 5", vo2Max: 50, restingHR: 59, maxDistance: 9.1 },
];

const enduranceStats = [
  {
    name: "5K Run Time",
    current: "22:15",
    previous: "23:30",
    improvement: "-5.3%",
    trend: "up" as const,
    unit: "min:sec",
  },
  {
    name: "10K Run Time",
    current: "48:20",
    previous: "51:15",
    improvement: "-5.7%",
    trend: "up" as const,
    unit: "min:sec",
  },
  {
    name: "Half Marathon",
    current: "1:52:30",
    previous: "2:05:45",
    improvement: "-10.6%",
    trend: "up" as const,
    unit: "hr:min",
  },
  {
    name: "Max Plank Hold",
    current: "4:25",
    previous: "3:45",
    improvement: "+17.8%",
    trend: "up" as const,
    unit: "min:sec",
  },
  {
    name: "Burpees (5 min)",
    current: "42",
    previous: "38",
    improvement: "+10.5%",
    trend: "up" as const,
    unit: "reps",
  },
  {
    name: "Max Distance",
    current: "9.1 mi",
    previous: "8.2 mi",
    improvement: "+11.0%",
    trend: "up" as const,
    unit: "miles",
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
    <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
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
  exercise: (typeof enduranceStats)[0];
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const isTimeImprovement = exercise.improvement.startsWith("-");

  return (
    <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{exercise.name}</h4>
        <div
          className={`flex items-center text-xs px-2 py-1 rounded-full ${
            exercise.trend === "up" || isTimeImprovement
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          <TrendingUp
            size={10}
            className={
              !isTimeImprovement && exercise.improvement.startsWith("-")
                ? "rotate-180"
                : ""
            }
          />
          <span className="ml-1">{exercise.improvement}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Current Best:
          </span>
          <div className="text-xl font-bold text-blue-600">
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

const EnduranceMetrics: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="w-full p-4 space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="VO2 Max Estimate"
          value="50"
          change="+2 pts"
          trend="up"
          icon={<Heart size={20} />}
        />
        <StatCard
          title="Resting Heart Rate"
          value="59 bpm"
          change="-6 bpm"
          trend="up"
          icon={<Timer size={20} />}
        />
        <StatCard
          title="Weekly Distance"
          value="28.5 mi"
          change="+12%"
          trend="up"
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Progress Chart */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Endurance Progress</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
            <Plus size={16} />
            Log Run
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={enduranceData}>
            <defs>
              <linearGradient id="colorVO2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === "dark" ? "#374151" : "#fff",
                border: `1px solid ${theme === "dark" ? "#6B7280" : "#E5E7EB"}`,
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="vo2Max"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorVO2)"
              name="VO2 Max"
            />
            <Line
              type="monotone"
              dataKey="maxDistance"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: "#10B981", r: 4 }}
              name="Max Distance (miles)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Exercise Progress Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Endurance Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enduranceStats.map((exercise, index) => (
            <ExerciseCard key={index} exercise={exercise} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnduranceMetrics;
