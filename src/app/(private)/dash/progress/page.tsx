"use client";
import StatsCard from "@/components/ui/StatsCard";
import LogCard from "@/components/ui/LogCard";
import { useEffect, useState } from "react";
import React from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import {
  Clock,
  DumbbellIcon,
  CalendarDaysIcon,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  LineChart,
} from "lucide-react";
import GraphicCard from "@/components/ui/GraphicCard";
import { useTheme } from "next-themes";

type Props = {};

const page = (props: Props) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");

  useEffect(() => {
    setIsLight(theme === "light");
  }, [theme]);

  const [periodStart, setPeriodStart] = useState(() => {
    const today = new Date();
    const startDay = today.getDate() >= 16 ? 16 : 1;
    return new Date(today.getFullYear(), today.getMonth(), startDay);
  });
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const today = new Date();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const year = periodStart.getFullYear();
  const month = periodStart.getMonth();
  const day = periodStart.getDate();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const periodEndDay = day === 1 ? Math.min(15, daysInMonth) : daysInMonth;

  const data = Array.from({ length: periodEndDay - day + 1 }, (_, i) => ({
    name: `${day + i}`, // day of month
    value: Math.floor(Math.random() * 60), // random minutes for now
  }));

  const yearData = Array.from({ length: 12 }, (_, i) => ({
    name: months[i],
    value: Math.floor(Math.random() * 1800), // random minutes for now
  }));

  const monthName2 = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    periodStart
  );
  const periodLabel = `${monthName2} ${day} - ${periodEndDay}`;

  const handlePrevPeriod = () => {
    let newDay, newMonth, newYear;
    if (day === 16) {
      newDay = 1;
      newMonth = month;
      newYear = year;
    } else {
      newMonth = month - 1;
      newYear = year;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      const prevMonthDays = new Date(newYear, newMonth + 1, 0).getDate();
      newDay = prevMonthDays >= 16 ? 16 : 1;
    }

    setPeriodStart(new Date(newYear, newMonth, newDay));
  };

  const handleNextPeriod = () => {
    let newDay, newMonth, newYear;
    const currentMonthDays = new Date(year, month + 1, 0).getDate();
    if (day === 1) {
      newDay = 16;
      newMonth = month;
      newYear = year;
    } else {
      newMonth = month + 1;
      newYear = year;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      newDay = 1;
    }

    setPeriodStart(new Date(newYear, newMonth, newDay));
  };

  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  const fullDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full h-full flex flex-col items-center px-4 gap-4">
      <div className="w-full flex items-center justify-between h-full pt-4">
        <span className="w-1/4 inline-flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-medium">
            {viewMode === "month" ? "Month" : "Year"}
          </h1>
          <button
            onClick={() => setViewMode(viewMode === "month" ? "year" : "month")}
            className="ml-2 text-2xl hover:cursor-pointer"
            aria-label="Toggle view"
          >
            {viewMode === "month" ? (
              <ChevronDown size={28} />
            ) : (
              <ChevronUp size={28} />
            )}
          </button>
        </span>
        <h1 className="text-sm md:text-base font-mediummd:text-xl flex flex-col leading-tight">
          <p className="">{weekday}</p>
          <p className="">{fullDate}</p>
        </h1>
      </div>
      <div className="w-full h-full flex flex-col items-center justify-center rounded-2xl overflow-hidden border border-neutral-200">
        <div
          className={`w-full h-full flex flex-col items-center justify-center ${
            isLight ? "bg-white" : "bg-[#1e1e1e]"
          } pt-12 pb-6 rounded-t-[8px]`}
        >
          <ResponsiveContainer width={"100%"} height={300}>
            {viewMode === "month" ? (
              <BarChart
                data={data}
                margin={{ top: 0, right: 20, bottom: 40, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickFormatter={(value) =>
                    parseInt(value) % 2 === 0 ? value : ""
                  }
                  interval={0}
                  label={{
                    value: monthName2,
                    position: "insideBottom",
                    offset: -20,
                  }}
                />
                <YAxis
                  label={{
                    value: "Training Time (Minutes)",
                    angle: -90,
                    position: "insideLeft",
                    dy: 80,
                  }}
                />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#65A30D"
                  radius={[6, 6, 0, 0]}
                />{" "}
                {/* Indigo-500 */}
              </BarChart>
            ) : (
              <BarChart
                data={yearData}
                margin={{ top: 0, right: 20, bottom: 40, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  label={{
                    value: year,
                    position: "insideBottom",
                    offset: -20,
                    style: { fontSize: 16 },
                  }}
                />
                <YAxis
                  label={{
                    value: "Training Time (Minutes)",
                    angle: -90,
                    position: "insideLeft",
                    dy: 80,
                    style: { fontSize: 16 },
                  }}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#65A30D" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        <span className="w-full flex items-center justify-between px-8 py-4 bg-black text-white">
          <span className="inline-flex items-center gap-2">
            {viewMode === "month" ? (
              <>
                <button
                  onClick={handlePrevPeriod}
                  className="text-2xl px-2 hover:cursor-pointer"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <h2 className="text-2xl md:text-3xl">{monthName2}</h2>
                <button
                  onClick={handleNextPeriod}
                  className="text-2xl px-2 hover:cursor-pointer"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            ) : (
              <h2 className="text-2xl md:text-3xl">{year}</h2>
            )}
          </span>
          <span className="flex flex-col leading-tight text-right">
            <h2 className="text-sm md:text-base font-medium">
              Total Training Time
            </h2>
            <h2 className="text-sm md:text-base font-medium">
              Time in Minutes
            </h2>
          </span>
        </span>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <StatsCard
          icon={<Clock color="#65A30D" size={28} />}
          format="hrs"
          value={data.filter((day) => day.value > 0).length}
          description="Total Workout Time"
        />
        <StatsCard
          icon={<LineChart color="#65A30D" size={28} />}
          format="days"
          value={data.filter((day) => day.value > 0).length}
          description="Highest Streak"
        />
        <StatsCard
          icon={
            <DumbbellIcon className="rotate-45" color="#65A30D" size={28} />
          }
          value="Push Workout 1"
          description="Favorite Workout"
        />
        <StatsCard
          icon={<CalendarDaysIcon color="#65A30D" size={28} />}
          value="Tuesday"
          description="Best Workout Day"
        />
      </div>

      <div className="w-full flex flex-col gap-4 mt-4">
        <LogCard
          icon={<ArrowRight size={28} />}
          title="View All Logs"
          description="Take a look at your log history"
          img="../pull-day-default.jpg"
        />
        <LogCard
          icon={<ArrowRight size={28} />}
          title="Plans Progress"
          description="View each plan's progress"
          img="../workout-library-default.jpg"
        />
      </div>

      <div className="w-full flex flex-col gap-4 mt-4">
        <h1 className="text-3xl font-medium">More Analytics</h1>
        <GraphicCard
          title="My Metrics"
          description="Numerical data you track - body weight, body fat, etc."
        />
        <GraphicCard
          title="Body Data"
          description="Track your daily nutrition - calories, macros, etc."
        />
        <GraphicCard
          title="My Mood"
          description="Track your personal records and progress on key lifts."
        />
      </div>
    </div>
  );
};

export default page;
