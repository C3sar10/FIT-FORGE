"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Plus, Weight, Activity, TrendingUp, Calendar, X } from "lucide-react";
import { useTheme } from "next-themes";
import { MetricLogType, ChartDataPoint, MetricSummary } from "@/types/metrics";
import { http } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Props = {};

// Modal Component for Adding New Metrics
interface MetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const MetricModal: React.FC<MetricModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [bodyFat, setBodyFat] = useState("");
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft" | "in">("cm");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight && !bodyFat && !height) {
      alert("Please enter at least one metric");
      return;
    }

    setIsSubmitting(true);
    try {
      const metrics: any = {};

      if (weight) {
        metrics.weight = {
          value: parseFloat(weight),
          unit: weightUnit,
        };
      }

      if (bodyFat) {
        metrics.bodyFat = {
          value: parseFloat(bodyFat),
        };
      }

      if (height) {
        metrics.height = {
          value: parseFloat(height),
          unit: heightUnit,
        };
      }

      const payload = {
        date,
        metrics,
        notes: notes.trim() || undefined,
      };

      await onSave(payload);

      // Reset form
      setWeight("");
      setBodyFat("");
      setHeight("");
      setNotes("");
      onClose();
    } catch (error) {
      console.error("Error saving metric:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <div className="border border-neutral-200 bg-neutral-800 text-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add Body Metrics</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Weight</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="Enter weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1 p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-800"
              />
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as "kg" | "lbs")}
                className="p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-800"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Body Fat %</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="Enter body fat percentage"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Height</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="Enter height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="flex-1 p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-800"
              />
              <select
                value={heightUnit}
                onChange={(e) =>
                  setHeightUnit(e.target.value as "cm" | "ft" | "in")
                }
                className="p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-800"
              >
                <option value="cm">cm</option>
                <option value="ft">ft</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Add any notes about your metrics..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-800 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 p-3 bg-lime-600 hover:bg-lime-700 text-white rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Metrics"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
}) => {
  return (
    <div className="p-4 border border-neutral-200 rounded-lg ">
      <div className="flex items-center justify-between mb-2">
        <div className="text-neutral-400">{icon}</div>
        {trend && trendValue && (
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
            <span className="ml-1">{trendValue}</span>
          </div>
        )}
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold">{value || "-"}</span>
        {unit && <span className="text-sm text-neutral-500 pb-1">{unit}</span>}
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{title}</p>
    </div>
  );
};

const MetricsBodyDataHeader: React.FC<Props> = () => {
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch metric logs
  const { data: metricLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["metricLogs"],
    queryFn: async () => {
      const res = await http.get("/metric-logs");
      return res.items || [];
    },
  });

  // Fetch summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["metricSummary"],
    queryFn: async () => {
      const res = await http.get("/metric-logs/summary");
      console.log("metric summary res: ", res);
      return res;
    },
  });

  // Helper function to calculate BMI
  const calculateBMI = (weight?: any, height?: any): number | undefined => {
    if (!weight?.value || !height?.value) return undefined;

    let weightInKg = weight.value;
    let heightInM = height.value;

    if (weight.unit === "lbs") weightInKg *= 0.453592;
    if (height.unit === "ft") heightInM *= 0.3048;
    else if (height.unit === "in") heightInM *= 0.0254;
    else if (height.unit === "cm") heightInM /= 100;

    return Math.round((weightInKg / (heightInM * heightInM)) * 10) / 10;
  };

  // Helper function to normalize weight to user's preferred unit
  const normalizeWeight = (
    weight: any,
    preferredUnit: "kg" | "lbs"
  ): number => {
    if (!weight?.value) return 0;

    let normalizedValue = weight.value;

    // Convert to target unit
    if (weight.unit === "kg" && preferredUnit === "lbs") {
      normalizedValue = normalizedValue * 2.20462;
    } else if (weight.unit === "lbs" && preferredUnit === "kg") {
      normalizedValue = normalizedValue * 0.453592;
    }

    return Math.round(normalizedValue * 10) / 10;
  };

  // Determine user's preferred weight unit from latest entry
  const preferredWeightUnit: "kg" | "lbs" = React.useMemo(() => {
    if (!metricLogs || metricLogs.length === 0) return "kg";

    // Find the most recent log with weight data
    const latestWeightLog = metricLogs.find(
      (log: MetricLogType) => log.metrics.weight
    );
    return latestWeightLog?.metrics.weight?.unit || "kg";
  }, [metricLogs]);

  // Process data for charts
  const chartData: ChartDataPoint[] = React.useMemo(() => {
    if (!metricLogs) return [];

    return metricLogs
      .slice(0, 30) // Last 30 entries
      .reverse()
      .map((log: MetricLogType) => ({
        date: new Date(log.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        weight: log.metrics.weight
          ? normalizeWeight(log.metrics.weight, preferredWeightUnit)
          : undefined,
        bodyFat: log.metrics.bodyFat?.value,
        bmi: calculateBMI(log.metrics.weight, log.metrics.height),
      }))
      .filter(
        (item: ChartDataPoint) => item.weight || item.bodyFat || item.bmi
      );
  }, [metricLogs, preferredWeightUnit]);

  // Handle saving new metric
  const handleSaveMetric = async (data: any) => {
    try {
      await http.post("/metric-logs", data);
      queryClient.invalidateQueries({ queryKey: ["metricLogs"] });
      queryClient.invalidateQueries({ queryKey: ["metricSummary"] });
    } catch (error) {
      console.error("Error saving metric:", error);
      throw error;
    }
  };

  if (logsLoading || summaryLoading) {
    return (
      <div className="w-full px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded"
              ></div>
            ))}
          </div>
          <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Body Metrics</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Track your body composition and health metrics over time
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Add Metrics</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Current Weight"
          value={summary?.latestWeight?.value || "-"}
          unit={summary?.latestWeight?.unit}
          icon={<Weight size={20} />}
        />
        <StatsCard
          title="Body Fat %"
          value={summary?.latestBodyFat || "-"}
          unit={summary?.latestBodyFat ? "%" : undefined}
          icon={<Activity size={20} />}
        />
        <StatsCard
          title="BMI"
          value={summary?.latestBMI?.bmi || "-"}
          unit={
            summary?.latestBMI ? `(${summary.latestBMI.category})` : undefined
          }
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weight Chart */}
          <div className="p-4 border border-neutral-200 rounded-lg ">
            <h3 className="text-lg font-semibold mb-4">
              Weight Trends ({preferredWeightUnit})
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: preferredWeightUnit,
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `${value} ${preferredWeightUnit}`,
                    "Weight",
                  ]}
                  labelStyle={{ color: theme === "dark" ? "#fff" : "#000" }}
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
                  dataKey="weight"
                  stroke="#65A30D"
                  strokeWidth={2}
                  dot={{ fill: "#65A30D", r: 4 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Body Fat & BMI Chart */}
          <div className="p-4 border border-neutral-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Body Composition</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "Body Fat %") {
                      return [`${value}%`, name];
                    }
                    return [value, name];
                  }}
                  labelStyle={{ color: theme === "dark" ? "#fff" : "#000" }}
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
                  dataKey="bodyFat"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: "#EF4444", r: 4 }}
                  connectNulls={false}
                  name="Body Fat %"
                />
                <Line
                  type="monotone"
                  dataKey="bmi"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", r: 4 }}
                  connectNulls={false}
                  name="BMI"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto mb-4 text-neutral-400" />
          <h3 className="text-lg font-medium mb-2">No metrics recorded yet</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Start tracking your body metrics to see trends and progress over
            time
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg"
          >
            Add Your First Metric
          </button>
        </div>
      )}

      {/* Modal */}
      <MetricModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMetric}
      />
    </div>
  );
};

export default MetricsBodyDataHeader;
