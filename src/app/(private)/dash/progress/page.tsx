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
import { LogAPI } from "@/lib/api";
import { WorkoutLogType } from "@/types/progress";
import { set } from "mongoose";
import { useRouter } from "next/navigation";

type Props = {};

const page = (props: Props) => {
  const router = useRouter();

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");
  const [userLogData, setUserLogData] = useState<WorkoutLogType[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [yearData, setYearData] = useState<any[]>([]);

  // stat cards data
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0); // in minutes
  const [highestStreak, setHighestStreak] = useState(0); // in days
  const [favoriteWorkout, setFavoriteWorkout] = useState(""); // workout name
  const [bestWorkoutDay, setBestWorkoutDay] = useState(""); // e.g. "Tuesday"
  const [favWorkoutData, setFavWorkoutData] = useState<{
    [key: number]: {
      month: number;
      workoutMap: { [key: string]: number };
    }[];
  }>({});

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

  const fetchLogData = async () => {
    // just fetch all for now, will fix later
    const res = await LogAPI.getLogs();
    console.log("res logs: ", res);
    setUserLogData(res.items);
  };

  useEffect(() => {
    fetchLogData();
  }, []);

  // helper: parse duration strings like "32m 24s" -> total seconds
  const parseDurationToSeconds = (dur?: string) => {
    if (!dur || typeof dur !== "string") return 0;
    // match e.g. '32m 24s' or '5m' or '45s'
    const m = dur.match(/(\d+)m/);
    const s = dur.match(/(\d+)s/);
    const minutes = m ? parseInt(m[1], 10) : 0;
    const seconds = s ? parseInt(s[1], 10) : 0;
    return minutes * 60 + seconds;
  };

  // build monthData (per-day) and yearData (per-month) from fetched logs
  useEffect(() => {
    if (!userLogData || userLogData.length === 0) {
      // initialize empty arrays for the selected period
      const daysCount = periodEndDay - day + 1;
      setMonthData(
        Array.from({ length: daysCount }, (_, i) => ({
          name: `${day + i}`,
          value: 0,
        }))
      );
      setYearData(
        Array.from({ length: 12 }, (_, i) => ({ name: months[i], value: 0 }))
      );
      return;
    }

    // Aggregate seconds per day for the current period and per month for the year
    const daysCount = periodEndDay - day + 1;
    const monthAgg: number[] = Array.from({ length: daysCount }, () => 0);
    const yearAgg: number[] = Array.from({ length: 12 }, () => 0);
    const favoriteWorkoutCount: {
      [key: number]: {
        month: number;
        workoutMap: { [key: string]: number };
      }[];
    } = {};

    userLogData.forEach((item) => {
      // createdOn should be a timestamp string
      const d = item.workoutDate
        ? new Date(item.workoutDate)
        : new Date(item.createdOn);

      const itemYear = d.getFullYear();
      const itemMonth = d.getMonth();
      const itemDate = d.getDate();
      const secs = parseDurationToSeconds(item.workoutDetails?.duration as any);

      if (item.workoutDetails?.workoutTitle) {
        if (!favoriteWorkoutCount[itemYear]) {
          favoriteWorkoutCount[itemYear] = [];
          favoriteWorkoutCount[itemYear][itemMonth] = {
            month: itemMonth,
            workoutMap: {
              [item.workoutDetails.workoutTitle]: 1,
            },
          };
        } else {
          if (!favoriteWorkoutCount[itemYear][itemMonth]) {
            favoriteWorkoutCount[itemYear][itemMonth] = {
              month: itemMonth,
              workoutMap: {},
            };
          }
          const favWorkoutMonth =
            favoriteWorkoutCount[itemYear][itemMonth].workoutMap;
          favWorkoutMonth[item.workoutDetails.workoutTitle] =
            (favWorkoutMonth[item.workoutDetails.workoutTitle] || 0) + 1;
        }
      }

      // accumulate into monthAgg if within the current period month/year
      if (itemYear === year && itemMonth === month) {
        // map day -> index
        if (itemDate >= day && itemDate <= periodEndDay) {
          const idx = itemDate - day;
          monthAgg[idx] += secs;
        }
      }

      // accumulate into yearAgg (for the selected year)
      if (itemYear === year) {
        yearAgg[itemMonth] += secs;
      }
    });

    setFavWorkoutData(favoriteWorkoutCount);

    // convert seconds to minutes (rounded)
    const monthDataOut = monthAgg.map((secs, i) => ({
      name: `${day + i}`,
      value: Math.round(secs / 60),
    }));
    const yearDataOut = yearAgg.map((secs, i) => ({
      name: months[i],
      value: Math.round(secs / 60),
    }));

    setMonthData(monthDataOut);
    setYearData(yearDataOut);
  }, [userLogData, periodStart]);

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

  const StatsCardUpdate = () => {
    //
    if (viewMode === "month") {
      const totalMins = monthData.reduce((sum, day) => sum + day.value, 0);
      setTotalWorkoutTime(totalMins);

      // highest streak calculation
      let streak = 0;
      let maxStreak = 0;

      monthData.forEach((day) => {
        if (day.value > 0) {
          streak += 1;
          if (streak > maxStreak) maxStreak = streak;
        } else {
          streak = 0;
        }
      });
      setHighestStreak(maxStreak);
      // favorite workout and best day would require more detailed log data analysis
      // For simplicity, we'll set dummy values here
      const favWorkoutMonth = favWorkoutData[year]?.[month]?.workoutMap || {};
      let favWorkout;
      if (favWorkoutMonth && Object.keys(favWorkoutMonth).length > 0) {
        favWorkout = Object.keys(favWorkoutMonth).reduce((a, b) =>
          favWorkoutMonth[a] > favWorkoutMonth[b] ? a : b
        );
      }

      setFavoriteWorkout(favWorkout || "N/A");

      setBestWorkoutDay("Tuesday");
    } else {
      const totalMins = yearData.reduce((sum, month) => sum + month.value, 0);
      setTotalWorkoutTime(totalMins);
      setHighestStreak(0);
      setFavoriteWorkout("N/A");
      setBestWorkoutDay("N/A");
    }
  };

  useEffect(() => {
    StatsCardUpdate();
  }, [viewMode, monthData, favWorkoutData]);

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
                data={monthData}
                margin={{ top: 0, right: 8, bottom: 8, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickFormatter={(value) =>
                    parseInt(value) % 2 === 0 ? value : ""
                  }
                  interval={0}
                />
                <YAxis />
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
                margin={{ top: 0, right: 8, bottom: 8, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
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
          format="mins"
          value={totalWorkoutTime}
          description="Total Workout Time"
        />
        <StatsCard
          icon={<LineChart color="#65A30D" size={28} />}
          format="days"
          value={highestStreak}
          description="Highest Streak"
        />
        <StatsCard
          icon={
            <DumbbellIcon className="rotate-45" color="#65A30D" size={28} />
          }
          value={favoriteWorkout}
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
          img="/browse-web/pull-day-default.jpg"
          action={() => {
            router.push("/dash/progress/logs/workoutLogs");
          }}
        />
        <LogCard
          icon={<ArrowRight size={28} />}
          title="Plans Progress"
          description="View each plan's progress"
          img="/browse-web/workout-library-default.jpg"
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
