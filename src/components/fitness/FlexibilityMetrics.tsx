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
import { TrendingUp, Maximize, RotateCcw, Plus } from "lucide-react";
import { useTheme } from "next-themes";

// Mock data for flexibility metrics
const flexibilityData = [
  { date: "Oct 1", sitReach: 8, shoulderFlex: 45, hipFlex: 85 },
  { date: "Oct 8", sitReach: 9, shoulderFlex: 48, hipFlex: 88 },
  { date: "Oct 15", sitReach: 10, shoulderFlex: 52, hipFlex: 92 },
  { date: "Oct 22", sitReach: 11, shoulderFlex: 55, hipFlex: 95 },
  { date: "Oct 29", sitReach: 12, shoulderFlex: 58, hipFlex: 98 },
  { date: "Nov 5", sitReach: 13, shoulderFlex: 62, hipFlex: 102 },
];

const flexibilityStats = [
  {
    name: "Sit & Reach",
    current: "13 in",
    previous: "8 in",
    improvement: "+62.5%",
    trend: "up" as const,
    unit: "inches",
  },
  {
    name: "Shoulder Flexibility",
    current: "62°",
    previous: "45°",
    improvement: "+37.8%",
    trend: "up" as const,
    unit: "degrees",
  },
  {
    name: "Hip Flexor",
    current: "102°",
    previous: "85°",
    improvement: "+20.0%",
    trend: "up" as const,
    unit: "degrees",
  },
  {
    name: "Hamstring Stretch",
    current: "85°",
    previous: "65°",
    improvement: "+30.8%",
    trend: "up" as const,
    unit: "degrees",
  },
  {
    name: "Spinal Twist",
    current: "78°",
    previous: "60°",
    improvement: "+30.0%",
    trend: "up" as const,
    unit: "degrees",
  },
  {
    name: "Calf Stretch",
    current: "42°",
    previous: "30°",
    improvement: "+40.0%",
    trend: "up" as const,
    unit: "degrees",
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
  exercise: (typeof flexibilityStats)[0];
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  return (
    <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{exercise.name}</h4>
        <div
          className={`flex items-center text-xs px-2 py-1 rounded-full ${
            exercise.trend === "up"
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          <TrendingUp size={10} />
          <span className="ml-1">{exercise.improvement}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Current Range:
          </span>
          <div className="text-xl font-bold text-green-600">
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

const FlexibilityMetrics: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="w-full p-4 space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Flexibility Score"
          value="87"
          change="+23 pts"
          trend="up"
          icon={<Maximize size={20} />}
        />
        <StatCard
          title="Range of Motion"
          value="78°"
          change="+15°"
          trend="up"
          icon={<RotateCcw size={20} />}
        />
        <StatCard
          title="Weekly Stretch Time"
          value="4.2 hrs"
          change="+45 min"
          trend="up"
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Flexibility Progress</h3>
            <button className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
              <Plus size={16} />
              Log Stretch
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={flexibilityData}>
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
                  border: `1px solid ${
                    theme === "dark" ? "#6B7280" : "#E5E7EB"
                  }`,
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="sitReach"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", r: 4 }}
                name="Sit & Reach (in)"
              />
              <Line
                type="monotone"
                dataKey="shoulderFlex"
                stroke="#059669"
                strokeWidth={2}
                dot={{ fill: "#059669", r: 4 }}
                name="Shoulder Flex (°)"
              />
              <Line
                type="monotone"
                dataKey="hipFlex"
                stroke="#047857"
                strokeWidth={2}
                dot={{ fill: "#047857", r: 4 }}
                name="Hip Flex (°)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold mb-4">Range Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={flexibilityData.slice(-1)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#374151" : "#fff",
                  border: `1px solid ${
                    theme === "dark" ? "#6B7280" : "#E5E7EB"
                  }`,
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="sitReach" fill="#10B981" name="Sit & Reach" />
              <Bar dataKey="shoulderFlex" fill="#059669" name="Shoulder Flex" />
              <Bar dataKey="hipFlex" fill="#047857" name="Hip Flex" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exercise Progress Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Flexibility Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flexibilityStats.map((exercise, index) => (
            <ExerciseCard key={index} exercise={exercise} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlexibilityMetrics;
