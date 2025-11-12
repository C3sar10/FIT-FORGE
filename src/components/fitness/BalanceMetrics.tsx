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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { TrendingUp, Scale, Target, Plus } from "lucide-react";
import { useTheme } from "next-themes";

// Mock data for balance metrics
const balanceData = [
  { date: "Oct 1", singleLeg: 25, bosu: 45, yoga: 30 },
  { date: "Oct 8", singleLeg: 28, bosu: 50, yoga: 35 },
  { date: "Oct 15", singleLeg: 32, bosu: 55, yoga: 42 },
  { date: "Oct 22", singleLeg: 35, bosu: 62, yoga: 48 },
  { date: "Oct 29", singleLeg: 38, bosu: 68, yoga: 55 },
  { date: "Nov 5", singleLeg: 42, bosu: 75, yoga: 62 },
];

const radarData = [
  { subject: "Static Balance", A: 85, fullMark: 100 },
  { subject: "Dynamic Balance", A: 72, fullMark: 100 },
  { subject: "Proprioception", A: 68, fullMark: 100 },
  { subject: "Core Stability", A: 90, fullMark: 100 },
  { subject: "Coordination", A: 75, fullMark: 100 },
  { subject: "Reaction Time", A: 82, fullMark: 100 },
];

const balanceStats = [
  {
    name: "Single Leg Stand",
    current: "42 sec",
    previous: "25 sec",
    improvement: "+68%",
    trend: "up" as const,
    unit: "seconds",
  },
  {
    name: "BOSU Ball Hold",
    current: "75 sec",
    previous: "45 sec",
    improvement: "+67%",
    trend: "up" as const,
    unit: "seconds",
  },
  {
    name: "Tree Pose",
    current: "62 sec",
    previous: "30 sec",
    improvement: "+107%",
    trend: "up" as const,
    unit: "seconds",
  },
  {
    name: "Eyes Closed Stand",
    current: "28 sec",
    previous: "15 sec",
    improvement: "+87%",
    trend: "up" as const,
    unit: "seconds",
  },
  {
    name: "Wobble Board",
    current: "85 sec",
    previous: "60 sec",
    improvement: "+42%",
    trend: "up" as const,
    unit: "seconds",
  },
  {
    name: "Tandem Walk",
    current: "45 steps",
    previous: "30 steps",
    improvement: "+50%",
    trend: "up" as const,
    unit: "steps",
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
  exercise: (typeof balanceStats)[0];
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
            Current Best:
          </span>
          <div className="text-xl font-bold text-purple-600">
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

const BalanceMetrics: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="w-full p-4 space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Balance Score"
          value="78"
          change="+15 pts"
          trend="up"
          icon={<Scale size={20} />}
        />
        <StatCard
          title="Stability Index"
          value="92%"
          change="+8%"
          trend="up"
          icon={<Target size={20} />}
        />
        <StatCard
          title="Avg Hold Time"
          value="58 sec"
          change="+22 sec"
          trend="up"
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Balance Assessment Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Balance Assessment</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
              />
              <Radar
                name="Balance Score"
                dataKey="A"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Chart */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Hold Time Progress</h3>
            <button className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm">
              <Plus size={16} />
              Log Balance
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={balanceData}>
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
                  border: `1px solid ${
                    theme === "dark" ? "#6B7280" : "#E5E7EB"
                  }`,
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="singleLeg"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: "#8B5CF6", r: 4 }}
                name="Single Leg Stand"
              />
              <Line
                type="monotone"
                dataKey="bosu"
                stroke="#A855F7"
                strokeWidth={2}
                dot={{ fill: "#A855F7", r: 4 }}
                name="BOSU Ball"
              />
              <Line
                type="monotone"
                dataKey="yoga"
                stroke="#C084FC"
                strokeWidth={2}
                dot={{ fill: "#C084FC", r: 4 }}
                name="Tree Pose"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exercise Progress Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Balance Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {balanceStats.map((exercise, index) => (
            <ExerciseCard key={index} exercise={exercise} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BalanceMetrics;
