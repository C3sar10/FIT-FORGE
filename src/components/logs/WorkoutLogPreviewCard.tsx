import { useDialog } from "@/context/DialogContext";
import { LogAPI } from "@/lib/api";
import { WorkoutLogType } from "@/types/progress";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import Toast from "@/components/ui/Toast";
import { span } from "framer-motion/client";
import { useRouter } from "next/navigation";

type Props = {
  workoutLog: WorkoutLogType;
};

const WorkoutLogPreviewCard: React.FC<Props> = ({ workoutLog }) => {
  const { showDialog, closeDialog } = useDialog();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    variant?: "success" | "error" | "info";
  }>({ open: false, message: "" });

  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/dash/progress/logs/${workoutLog.logId}`);
  };

  const handleDelete = async () => {
    // Implement delete functionality
    const result = await showDialog({
      title: "Delete Workout Log?",
      message: `Are you sure you want to delete your workout log ${workoutLog.title}? This action cannot be undone.`,
      actions: [
        { id: "cancel", label: "Cancel", variant: "secondary" },
        { id: "delete", label: "Delete Log", variant: "danger" },
      ],
    });

    if (result === "delete") {
      // Call API to delete log
      try {
        await LogAPI.deleteLog(workoutLog.logId);
        // Optionally, refresh the list or provide feedback
        queryClient.invalidateQueries({ queryKey: ["workoutLogs"] });
        setTimeout(() => {
          setToast({
            open: true,
            message: "Workout log deleted successfully.",
            variant: "success",
          });
        }, 1000);
      } catch (error) {
        console.error("Failed to delete workout log:", error);
        setToast({
          open: true,
          message: "Failed to delete workout log. Please try again.",
          variant: "error",
        });
      } finally {
        closeDialog();
      }
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto border border-neutral-200 rounded-2xl p-4 flex flex-col">
      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast({ open: false, message: "" })}
      />
      <div className="w-full flex flex-col items-start pb-4 border-b border-neutral-200">
        <div className="w-full flex items-center justify-between">
          <h2 className="text-sm font-medium ">Workout Log</h2>
          <p className="text-sm text-neutral-400">
            #{workoutLog.logId.slice(-6)}
          </p>
        </div>
        <div className="w-full flex flex-col items-start">
          <h1 className="text-xl font-semibold">
            {workoutLog.title || "Untitled Workout"}
          </h1>
          <p className="text-base text-neutral-400">
            {workoutLog.description || "No description provided."}
          </p>
        </div>
      </div>
      <div className="w-full flex flex-col pt-4">
        <div className="w-full flex items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">Created On</p>
            <p className="text-neutral-400 text-sm">
              {new Date(workoutLog.createdOn).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Last Updated</p>
            <p className="text-neutral-400 text-sm">
              {new Date(workoutLog.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="w-full flex items-center justify-between gap-2">
          <div
            onClick={handleViewDetails}
            className="cursor-pointer px-4 py-2 border border-neutral-200 hover:bg-neutral-200 hover:text-black rounded-sm flex items-center justify-center text-xs"
          >
            View Details
          </div>
          <div
            onClick={handleDelete}
            className="cursor-pointer px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-sm flex items-center justify-center text-xs"
          >
            Delete Log
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutLogPreviewCard;
