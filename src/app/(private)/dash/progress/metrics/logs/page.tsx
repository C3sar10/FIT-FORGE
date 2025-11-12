"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Weight,
  Activity,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { http } from "@/lib/api";
import { MetricLogType } from "@/types/metrics";

type Props = {};

const MetricLogCard: React.FC<{ log: MetricLogType }> = ({ log }) => {
  const router = useRouter();
  const logDate = new Date(log.date);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  const bmi = calculateBMI(log.metrics.weight, log.metrics.height);

  return (
    <div
      onClick={() => router.push(`/dash/progress/metrics/logs/${log.logId}`)}
      className="w-full max-w-2xl mx-auto p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-neutral-500" />
          <span className="text-sm font-medium">{formatDate(logDate)}</span>
        </div>
        <span className="text-xs text-neutral-500">
          {new Date(log.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3">
        {log.metrics.weight && (
          <div className="flex items-center gap-2">
            <Weight size={16} className="text-blue-600" />
            <div>
              <p className="text-sm font-medium">
                {log.metrics.weight.value} {log.metrics.weight.unit}
              </p>
              <p className="text-xs text-neutral-500">Weight</p>
            </div>
          </div>
        )}

        {log.metrics.bodyFat && (
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-red-600" />
            <div>
              <p className="text-sm font-medium">
                {log.metrics.bodyFat.value}%
              </p>
              <p className="text-xs text-neutral-500">Body Fat</p>
            </div>
          </div>
        )}

        {bmi && (
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-green-600" />
            <div>
              <p className="text-sm font-medium">{bmi}</p>
              <p className="text-xs text-neutral-500">BMI</p>
            </div>
          </div>
        )}
      </div>

      {log.notes && (
        <div className="mt-2 p-2 bg-neutral-50 dark:bg-neutral-700 rounded text-sm">
          <p className="line-clamp-2">{log.notes}</p>
        </div>
      )}
    </div>
  );
};

const MetricLogsPage: React.FC<Props> = () => {
  const router = useRouter();

  const {
    data: metricLogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["metricLogs"],
    queryFn: async () => {
      const res = await http.get("/metric-logs");
      return res.items || [];
    },
  });

  return (
    <div className="w-full h-full flex flex-col items-start">
      <div className="flex w-full p-4 items-center gap-4">
        <ArrowLeft
          className="cursor-pointer hover:text-lime-500"
          size={24}
          onClick={() => router.back()}
        />
        <h1 className="text-2xl font-medium">Metric Logs</h1>
      </div>

      <div className="w-full flex flex-col items-center gap-4 px-4">
        {isLoading ? (
          <div className="space-y-4 w-full max-w-2xl">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading metric logs.</p>
          </div>
        ) : metricLogs && metricLogs.length > 0 ? (
          metricLogs.map((log: MetricLogType) => (
            <MetricLogCard key={log.logId} log={log} />
          ))
        ) : (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto mb-4 text-neutral-400" />
            <h3 className="text-lg font-medium mb-2">No metric logs yet</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Start tracking your body metrics to see your progress over time
            </p>
            <button
              onClick={() => router.push("/dash/progress/metrics")}
              className="px-6 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg"
            >
              Go to Metrics Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricLogsPage;
