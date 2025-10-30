"use client";
import WorkoutLogPreviewCard from "@/components/logs/WorkoutLogPreviewCard";
import { LogAPI } from "@/lib/api";
import { WorkoutLogType } from "@/types/progress";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {};

const page = (props: Props) => {
  const router = useRouter();

  const {
    data: workoutLogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workoutLogs"],
    queryFn: async () => {
      // Fetch workout logs from API
      const res = await LogAPI.getLogs();
      return res.items;
    },
  }); // Placeholder for data fetching logic

  return (
    <div className="w-full h-full flex flex-col items-start">
      <div className="flex w-full p-4 items-center">
        <ArrowLeft
          className="cursor-pointer hover:text-lime-500"
          size={24}
          onClick={() => router.back()}
        />
      </div>
      <div className="w-full flex flex-col items-center gap-4 px-4">
        {isLoading ? (
          <p>Loading workout logs...</p>
        ) : (
          workoutLogs?.map((log: WorkoutLogType) => (
            <WorkoutLogPreviewCard key={log.logId} workoutLog={log} />
          ))
        )}
        {error && <p>Error loading workout logs.</p>}
      </div>
    </div>
  );
};

export default page;
