import React, { useEffect, useState } from "react";
import { Calendar } from "../ui/calendar";
import { useTheme } from "next-themes";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Plus,
} from "lucide-react";
import { div } from "framer-motion/client";

type Props = {};

const WeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekDates(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const ScheduleBlock = () => {
  return (
    <div className="w-full h-24 bg-gradient-to-r from-lime-950 to-lime-600 border border-neutral-200 rounded-2xl flex items-center justify-between gap-4 overflow-hidden">
      <div className="h-full flex items-center gap-4 p-4">
        <div className="rounded-full aspect-square h-full flex items-center justify-center bg-lime-700 text-2xl text-white">
          W
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-lg text-white">Push Workout</span>
          <span className="text-sm text-neutral-300">Scheduled Workout</span>
        </div>
      </div>
      <div className="h-full aspect-square w-auto bg-neutral-400">
        <img
          src="/running-default.webp"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

type DayBlockProps = {
  date: Date;
  events: Array<any>;
};

const DayBlock = ({ date, events }: DayBlockProps) => {
  return (
    <div className="flex flex-col items-start w-full h-full">
      <h2 className="text-base">{date.toLocaleDateString()}</h2>
      <h3 className="text-2xl font-medium">
        {date.toLocaleString("default", { weekday: "long" })}
      </h3>
      <div className="flex flex-col gap-4 w-full pt-4">
        {events.length === 0 && (
          <span className="text-sm text-neutral-400">No events scheduled</span>
        )}
        {events.length > 0 &&
          events.map((event, index) => <ScheduleBlock key={index} />)}
      </div>
    </div>
  );
};

const ScheduleCalendar = (props: Props) => {
  // Refs for sticky calendars
  const miniCalRef = React.useRef<HTMLDivElement | null>(null);
  const bigCalRef = React.useRef<HTMLDivElement | null>(null);
  const dayBlockRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  // Helper to get all days in the week of the selected date
  const getWeekDatesForSelected = (selected: Date | undefined) => {
    if (!selected) return [];
    const start = new Date(selected);
    start.setDate(selected.getDate() - selected.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };
  // Dummy events for demonstration
  const getEventsForDate = (date: Date) => {
    // Replace with real event fetching logic
    if (date.getDate() % 2 === 0) return [{ id: 1 }];
    return [];
  };

  const [date, setDate] = useState<Date | undefined>(new Date());
  const { theme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");
  const [miniCalendar, setMiniCalendar] = useState(true);
  const [weekStart, setWeekStart] = useState(new Date());

  useEffect(() => {
    // Scroll selected day to top
    const idx = getWeekDatesForSelected(date).findIndex(
      (d) => date && d.toDateString() === date.toDateString()
    );
    if (idx !== -1 && dayBlockRefs.current[idx]) {
      let offset = 0;
      if (miniCalendar && miniCalRef.current) {
        offset += miniCalRef.current.offsetHeight;
      }
      if (!miniCalendar && bigCalRef.current) {
        offset += bigCalRef.current.offsetHeight;
      }
      console.log("offset", offset);
      const blockTop = dayBlockRefs.current[idx].offsetTop;
      console.log("blockTop", blockTop);
      parent.scrollTo({
        top: blockTop - offset - 64, // extra padding
        behavior: "smooth",
      });
    }
  }, [date, miniCalendar]);
  // ...existing code...

  useEffect(() => {
    setIsLight(theme === "light");
  }, [theme]);

  // For mini calendar: get current week dates
  const weekDates = getWeekDates(weekStart);

  return (
    <div className="w-full p-4 flex flex-col gap-4">
      <div
        className={`w-full h-full sticky z-10 pb-6 top-4
             mx-auto p-4 border border-neutral-200 ${
               isLight ? "bg-white" : "bg-neutral-950"
             } rounded-2xl`}
      >
        {!miniCalendar ? (
          <div ref={bigCalRef} className="">
            <Calendar
              className="w-full h-full bg-transparent max-w-[500px] mx-auto"
              mode="single"
              selected={date}
              onSelect={setDate}
            />
          </div>
        ) : (
          <div ref={miniCalRef} className="flex flex-col items-center pb-6 ">
            <div className="flex justify-between w-full mb-2">
              <button
                className="px-2 py-1 rounded "
                onClick={() =>
                  setWeekStart(
                    new Date(weekStart.setDate(weekStart.getDate() - 7))
                  )
                }
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-semibold">
                Week of {weekDates[0].toLocaleDateString()}
              </span>
              <button
                className="px-2 py-1 rounded "
                onClick={() =>
                  setWeekStart(
                    new Date(weekStart.setDate(weekStart.getDate() + 7))
                  )
                }
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 w-full">
              {/* First row: weekday names */}
              {WeekDays.map((day, index) => (
                <div key={index} className="flex items-center justify-center">
                  <span className="text-sm text-neutral-400">{day}</span>
                </div>
              ))}
              {/* Second row: date numbers only */}
              {weekDates.map((d) => (
                <button
                  key={d.toISOString()}
                  className={`p-2 rounded row-start-2 ${
                    date?.toDateString() === d.toDateString()
                      ? isLight
                        ? "bg-neutral-800 text-white"
                        : "bg-white text-black"
                      : isLight
                      ? "bg-white"
                      : "bg-neutral-700 text-white"
                  }`}
                  onClick={() => setDate(d)}
                >
                  {d.getDate()}
                </button>
              ))}
            </div>
          </div>
        )}
        {miniCalendar ? (
          <div
            onClick={() => setMiniCalendar((v) => !v)}
            className="absolute bottom-4 right-4 flex flex-row items-center gap-2 w-fit"
          >
            <span className="text-xs">Full Calendar</span>
            <ChevronDown size={16} />
          </div>
        ) : (
          <div
            onClick={() => setMiniCalendar((v) => !v)}
            className="absolute bottom-4 right-4 flex flex-row items-center gap-2 w-fit"
          >
            <span className="text-xs">Mini Calendar</span>
            <ChevronUp size={16} />
          </div>
        )}
      </div>
      <button className="h-16 w-full max-w-[500px] mx-auto rounded-2xl bg-black hover:bg-[#1e1e1e] text-white flex items-center text-center justify-center gap-2">
        <Plus size={16} /> <span>Schedule Event</span>
      </button>
      {/* Only show DayBlocks for the selected week, scroll selected to top */}
      <div className="w-full max-w-[500px] mx-auto flex flex-col gap-4 py-2">
        {getWeekDatesForSelected(date).map((d, idx) => (
          <div
            key={d.toISOString()}
            className="min-h-[120px]"
            ref={(el) => {
              dayBlockRefs.current[idx] = el;
            }}
          >
            <DayBlock date={d} events={getEventsForDate(d)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
