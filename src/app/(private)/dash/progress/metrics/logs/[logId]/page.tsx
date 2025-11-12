"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Save,
  X,
  Calendar,
  Weight,
  Activity,
  TrendingUp,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { http } from "@/lib/api";
import { MetricLogType } from "@/types/metrics";
import { useDialog } from "@/context/DialogContext";
import { log } from "console";

type Props = {};

const MetricLogDetailPage: React.FC<Props> = () => {
  const router = useRouter();
  const { logId } = useParams();
  const queryClient = useQueryClient();
  const { showDialog } = useDialog();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{
    date: string;
    weight: string;
    weightUnit: "kg" | "lbs";
    bodyFat: string;
    height: string;
    heightUnit: "cm" | "ft" | "in";
    notes: string;
  }>({
    date: "",
    weight: "",
    weightUnit: "kg",
    bodyFat: "",
    height: "",
    heightUnit: "cm",
    notes: "",
  });

  const {
    data: metricLog,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["metricLog", logId],
    queryFn: async () => {
      const res = await http.get(`/metric-logs/${logId}`);
      return res;
    },
    enabled: !!logId,
  });

  // Initialize edit data when metric log loads
  React.useEffect(() => {
    if (metricLog && !isEditing) {
      setEditData({
        date: new Date(metricLog.date).toISOString().split("T")[0],
        weight: metricLog.metrics.weight?.value?.toString() || "",
        weightUnit: metricLog.metrics.weight?.unit || "kg",
        bodyFat: metricLog.metrics.bodyFat?.value?.toString() || "",
        height: metricLog.metrics.height?.value?.toString() || "",
        heightUnit: metricLog.metrics.height?.unit || "cm",
        notes: metricLog.notes || "",
      });
    }
  }, [metricLog, isEditing]);

  const calculateBMI = (
    weight?: any,
    height?: any
  ): { bmi: number; category: string } | null => {
    if (!weight?.value || !height?.value) return null;

    let weightInKg = weight.value;
    let heightInM = height.value;

    if (weight.unit === "lbs") weightInKg *= 0.453592;
    if (height.unit === "ft") heightInM *= 0.3048;
    else if (height.unit === "in") heightInM *= 0.0254;
    else if (height.unit === "cm") heightInM /= 100;

    const bmi = Math.round((weightInKg / (heightInM * heightInM)) * 10) / 10;

    let category = "Normal weight";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi >= 25 && bmi < 30) category = "Overweight";
    else if (bmi >= 30) category = "Obesity";

    return { bmi, category };
  };

  const handleSave = async () => {
    try {
      const metrics: any = {};

      if (editData.weight) {
        metrics.weight = {
          value: parseFloat(editData.weight),
          unit: editData.weightUnit,
        };
      }

      if (editData.bodyFat) {
        metrics.bodyFat = {
          value: parseFloat(editData.bodyFat),
        };
      }

      if (editData.height) {
        metrics.height = {
          value: parseFloat(editData.height),
          unit: editData.heightUnit,
        };
      }

      const payload = {
        date: editData.date,
        metrics,
        notes: editData.notes.trim() || undefined,
      };

      await http.patch(`/metric-logs/${logId}`, payload);
      queryClient.invalidateQueries({ queryKey: ["metricLog", logId] });
      queryClient.invalidateQueries({ queryKey: ["metricLogs"] });
      queryClient.invalidateQueries({ queryKey: ["metricSummary"] });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating metric log:", error);
    }
  };

  const handleDelete = async () => {
    const result = await showDialog({
      title: "Delete Metric Log?",
      message:
        "Are you sure you want to delete this metric log? This action cannot be undone.",
      actions: [
        { id: "cancel", label: "Cancel", variant: "secondary" },
        { id: "delete", label: "Delete Log", variant: "danger" },
      ],
    });

    if (result === "delete") {
      try {
        if (!logId) return;
        await http.del(`/metric-logs/${logId}`);
        queryClient.invalidateQueries({ queryKey: ["metricLogs"] });
        queryClient.invalidateQueries({ queryKey: ["metricSummary"] });
        router.back();
      } catch (error) {
        console.error("Failed to delete metric log:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-start">
        <div className="flex w-full p-4 items-center gap-4">
          <ArrowLeft
            className="cursor-pointer hover:text-lime-500"
            size={24}
            onClick={() => router.back()}
          />
          <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
        </div>
        <div className="w-full p-4 space-y-4">
          <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
          <div className="h-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !metricLog) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-red-600">
          Metric log not found or error loading data.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-neutral-200 hover:bg-neutral-300 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const logDate = new Date(metricLog.date);
  const bmiData = calculateBMI(
    metricLog.metrics.weight,
    metricLog.metrics.height
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex w-full p-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <ArrowLeft
            className="cursor-pointer hover:text-lime-500"
            size={24}
            onClick={() => router.back()}
          />
          <h1 className="text-2xl font-medium">
            Metric Log -{" "}
            {logDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-500 hover:bg-neutral-600 text-white rounded"
              >
                <X size={16} />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                <Edit3 size={16} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="w-full p-4 space-y-6">
        {/* Date */}
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={20} className="text-neutral-600" />
            <h3 className="text-lg font-semibold">Date</h3>
          </div>
          {isEditing ? (
            <input
              type="date"
              value={editData.date}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-700"
            />
          ) : (
            <p className="text-neutral-700 dark:text-neutral-300">
              {logDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weight */}
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-2">
              <Weight size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold">Weight</h3>
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Weight"
                    value={editData.weight}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        weight: e.target.value,
                      }))
                    }
                    className="flex-1 p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-700"
                  />
                  <select
                    value={editData.weightUnit}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        weightUnit: e.target.value as "kg" | "lbs",
                      }))
                    }
                    className="p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-700"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>
            ) : metricLog.metrics.weight ? (
              <p className="text-2xl font-bold text-blue-600">
                {metricLog.metrics.weight.value} {metricLog.metrics.weight.unit}
              </p>
            ) : (
              <p className="text-neutral-500 italic">Not recorded</p>
            )}
          </div>

          {/* Body Fat */}
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={20} className="text-red-600" />
              <h3 className="text-lg font-semibold">Body Fat %</h3>
            </div>
            {isEditing ? (
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Body fat %"
                value={editData.bodyFat}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, bodyFat: e.target.value }))
                }
                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-700"
              />
            ) : metricLog.metrics.bodyFat ? (
              <p className="text-2xl font-bold text-red-600">
                {metricLog.metrics.bodyFat.value}%
              </p>
            ) : (
              <p className="text-neutral-500 italic">Not recorded</p>
            )}
          </div>

          {/* BMI */}
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold">BMI</h3>
            </div>
            {bmiData ? (
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {bmiData.bmi}
                </p>
                <p className="text-sm text-neutral-600">({bmiData.category})</p>
              </div>
            ) : (
              <p className="text-neutral-500 italic">
                {isEditing ? "Enter weight & height" : "Insufficient data"}
              </p>
            )}
          </div>
        </div>

        {/* Height */}
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold mb-2">Height</h3>
          {isEditing ? (
            <div className="flex gap-2 max-w-xs">
              <input
                type="number"
                step="0.1"
                placeholder="Height"
                value={editData.height}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, height: e.target.value }))
                }
                className="flex-1 p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-700"
              />
              <select
                value={editData.heightUnit}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    heightUnit: e.target.value as "cm" | "ft" | "in",
                  }))
                }
                className="p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-700"
              >
                <option value="cm">cm</option>
                <option value="ft">ft</option>
                <option value="in">in</option>
              </select>
            </div>
          ) : metricLog.metrics.height ? (
            <p className="text-lg">
              {metricLog.metrics.height.value} {metricLog.metrics.height.unit}
            </p>
          ) : (
            <p className="text-neutral-500 italic">Not recorded</p>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold mb-2">Notes</h3>
          {isEditing ? (
            <textarea
              placeholder="Add notes about your metrics..."
              value={editData.notes}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={4}
              className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded dark:bg-neutral-700 resize-none"
            />
          ) : metricLog.notes ? (
            <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
              {metricLog.notes}
            </p>
          ) : (
            <p className="text-neutral-500 italic">No notes added</p>
          )}
        </div>

        {/* Metadata */}
        <div className="text-xs text-neutral-500 space-y-1">
          <p>Created: {new Date(metricLog.createdAt).toLocaleString()}</p>
          <p>
            Last updated: {new Date(metricLog.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetricLogDetailPage;
