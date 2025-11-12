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
import { TrendingUp, Zap, Clock, Plus } from "lucide-react";
import { useTheme } from "next-themes";

// Mock data for speed metrics
const speedData = [
  { date: "Oct 1", sprint40: 5.8, mile: 7.2, cycling: 22.5 },
  { date: "Oct 8", sprint40: 5.6, mile: 7.0, cycling: 23.1 },
  { date: "Oct 15", sprint40: 5.5, mile: 6.8, cycling: 23.8 },
  { date: "Oct 22", sprint40: 5.4, mile: 6.6, cycling: 24.2 },
  { date: "Oct 29", sprint40: 5.3, mile: 6.4, cycling: 24.7 },
  { date: "Nov 5", sprint40: 5.2, mile: 6.2, cycling: 25.3 },
];

const speedStats = [
  {
    name: "40-Yard Dash",
    current: "5.2 sec",
    previous: "5.8 sec",
    improvement: "-10.3%",
    trend: "up" as const,
    unit: "seconds",
  },
  {
    name: "Mile Run",
    current: "6:12",
    previous: "7:12",
    improvement: "-13.9%",
    trend: "up" as const,
    unit: "min:sec",
  },
  {
    name: "100m Sprint",
    current: "13.8 sec",
    previous: "14.5 sec",
    improvement: "-4.8%",
    trend: "up" as const,
    unit: "seconds",
  },
  {
    name: "Cycling (1 mile)",
    current: "2:22",
    previous: "2:40",
    improvement: "-11.3%",
    trend: "up" as const,
    unit: "min:sec",
  },
  {
    name: "Swimming (50m)",
    current: "42.5 sec",
    previous: "46.2 sec",
    improvement: "-8.0%",
    trend: "up" as const,
    unit: "seconds",
  },
  {
    name: "Agility Ladder",
    current: "8.7 sec",
    previous: "9.4 sec",
    improvement: "-7.4%",
    trend: "up" as const,
    unit: "seconds",
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
  exercise: (typeof speedStats)[0];
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const isTimeImprovement = exercise.improvement.startsWith("-");

  return (
    <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{exercise.name}</h4>
        <div
          className={`flex items-center text-xs px-2 py-1 rounded-full ${
            isTimeImprovement
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          <TrendingUp
            size={10}
            className={!isTimeImprovement ? "rotate-180" : ""}
          />
          <span className="ml-1">{exercise.improvement}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Current Best:
          </span>
          <div className="text-xl font-bold text-yellow-600">
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

const SpeedMetrics: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="w-full p-4 space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Top Speed"
          value="25.3 mph"
          change="+2.1 mph"
          trend="up"
          icon={<Zap size={20} />}
        />
        <StatCard
          title="Avg Sprint Time"
          value="5.2 sec"
          change="-0.6 sec"
          trend="up"
          icon={<Clock size={20} />}
        />
        <StatCard
          title="Speed Score"
          value="732"
          change="+45 pts"
          trend="up"
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Progress Chart */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Speed Progress (Lower is Better)
          </h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm">
            <Plus size={16} />
            Log Sprint
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={speedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: "Time (seconds)",
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
              dataKey="sprint40"
              stroke="#EAB308"
              strokeWidth={2}
              dot={{ fill: "#EAB308", r: 4 }}
              name="40-Yard Dash"
            />
            <Line
              type="monotone"
              dataKey="mile"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ fill: "#F59E0B", r: 4 }}
              name="Mile Run"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Exercise Progress Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Speed Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {speedStats.map((exercise, index) => (
            <ExerciseCard key={index} exercise={exercise} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpeedMetrics;
