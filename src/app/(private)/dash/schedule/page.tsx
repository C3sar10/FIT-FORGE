"use client";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";
import React from "react";

type Props = {};

const page = (props: Props) => {
  return (
    <div className="w-full h-full">
      <ScheduleCalendar />
    </div>
  );
};

export default page;
