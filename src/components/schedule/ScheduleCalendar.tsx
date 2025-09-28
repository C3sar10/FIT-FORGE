import React, { useEffect, useState } from "react";
import { EventAPI } from "@/lib/api";
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
import { useEvent } from "@/context/EventContext";
import { useQuery } from "@tanstack/react-query";
//import type { Event } from "@/types/event";
import type { Event } from "@/types/event";

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

type ScheduleBlockProps = {
  event: Event;
};

const ScheduleBlock = ({ event }: ScheduleBlockProps) => {
  const eventTime = new Date(event.date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="w-full h-24 bg-gradient-to-r from-lime-950 to-lime-600 border border-neutral-200 rounded-2xl flex items-center justify-between gap-4 overflow-hidden">
      <div className="h-full flex items-center gap-4 p-4">
        <div className="rounded-full aspect-square h-full flex items-center justify-center bg-lime-700 text-2xl text-white">
          {
            event.type?.charAt(0).toUpperCase() ?? "E" // Default to "E" if type is undefined
          }
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-lg text-white leading-tight">
            {event.title}
          </span>
          <span className="text-sm text-neutral-300">{eventTime}</span>
        </div>
      </div>
      <div className="h-full aspect-square w-auto bg-lime-950">
        {event.workoutDetails && event.workoutDetails.image && (
          <img
            src={event.workoutDetails.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
};

type DayBlockProps = {
  date: Date;
  events: Array<any>;
};
const DayBlock = ({
  date,
  events,
  highlighted = false,
}: DayBlockProps & { highlighted?: boolean }) => {
  const { theme, setTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");

  useEffect(() => {
    setIsLight(theme === "light");
  }, [theme]);

  return (
    <div
      className={`flex flex-col items-start w-full h-full transition-colors duration-400 ${
        highlighted
          ? isLight
            ? "bg-lime-200/50 rounded-2xl p-4"
            : "bg-lime-700/50 rounded-2xl p-4"
          : ""
      }`}
    >
      <h2 className="text-base">{date.toLocaleDateString()}</h2>
      <div className="flex items-center gap-1">
        <h3 className="text-2xl font-medium">
          {date.toLocaleString("default", { weekday: "long" })}
        </h3>
        {date.toDateString() === new Date().toDateString() && (
          <span className="text-sm text-lime-500 font-medium">- Today</span>
        )}
      </div>

      <div className="flex flex-col gap-4 w-full pt-4">
        {events.length === 0 && (
          <span className="text-sm text-neutral-400">No events scheduled</span>
        )}
        {events.length > 0 &&
          events.map((event, index) => (
            <ScheduleBlock event={event} key={index} />
          ))}
      </div>
    </div>
  );
};

const ScheduleCalendar = (props: Props) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { theme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");
  const [miniCalendar, setMiniCalendar] = useState(true);
  const [weekStart, setWeekStart] = useState(new Date());
  const [highlightDate, setHighlightDate] = useState<Date | null>(null);

  const selectDate = (d: Date | undefined) => {
    if (!d) return;
    setDate(d);
    setHighlightDate(d);
    // clear highlight after a short duration
    //setTimeout(() => setHighlightDate(null), 1500);
  };

  // Fetch all user events once per session and cache in React Query.
  const {
    data: fetchedEvents,
    isLoading: loadingEvents,
    refetch: refetchEvents,
  } = useQuery<Event[], Error>({
    queryKey: ["events", "all"],
    queryFn: async () => {
      const res = await EventAPI.list("all", 100);
      return res.items || [];
    },
    staleTime: Infinity, // never considered stale during the session
    // cacheTime is intentionally not set here; React Query will keep the data
    // in memory for a reasonable default. We rely on `staleTime: Infinity`
    // to keep data fresh for the session.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  // Debug state for fetch errors (visible in dev only)
  const [lastFetchError, setLastFetchError] = useState<string | null>(null);

  // Sync React Query results into local state so existing code can use `userEvents`.
  // We only set when the query returns data.
  useEffect(() => {
    if (Array.isArray(fetchedEvents) && fetchedEvents.length > 0) {
      setUserEvents(fetchedEvents as Event[]);
    }
    // If fetchedEvents is empty we leave existing userEvents (so we don't overwrite)
  }, [fetchedEvents]);

  // Show fetch errors in dev: listen for query errors via a try/catch wrapper when refetching
  useEffect(() => {
    (async () => {
      try {
        await refetchEvents();
        setLastFetchError(null);
      } catch (err: any) {
        setLastFetchError(String(err?.message ?? err));
      }
    })();
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get events for a date from the current month
  const getEventsForDate = (date: Date) => {
    const events = userEvents || [];
    return events.filter((ev: Event) => {
      const evDate = new Date(ev.date);
      return (
        evDate.getFullYear() === date.getFullYear() &&
        evDate.getMonth() === date.getMonth() &&
        evDate.getDate() === date.getDate()
      );
    });
  };
  const { eventModalOpen, openEventModal, closeEventModal } = useEvent();

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

  // userEvents state is populated from React Query results below
  const [userEvents, setUserEvents] = useState<Event[]>([]);

  // When date changes, scroll to that day block

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

  // When miniCalendar toggles, some calendar libraries need a resize event to recompute dimensions (especially on mobile).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        window.dispatchEvent(new Event("resize"));
      } catch (e) {
        // ignore
      }
    }, 120); // small delay to allow DOM to update
    return () => clearTimeout(t);
  }, [miniCalendar]);

  return (
    <div className="w-full p-4 flex flex-col gap-4">
      {process.env.NODE_ENV !== "production" && (
        <div className="max-w-[500px] mx-auto p-2 mb-2 text-xs text-neutral-600">
          <div>
            Debug: events URL: {process.env.NEXT_PUBLIC_API_URL}
            /events?scope=all&amp;limit=100
          </div>
          {lastFetchError && (
            <div className="text-red-600">
              Last fetch error: {lastFetchError}
            </div>
          )}
        </div>
      )}
      <div
        className={`w-full sticky z-10 pb-6 top-4
             mx-auto p-4 border border-neutral-200 ${
               isLight ? "bg-white" : "bg-neutral-950"
             } rounded-2xl`}
      >
        {!miniCalendar ? (
          <div ref={bigCalRef} className="w-full">
            <Calendar
              className="w-full bg-transparent max-w-[500px] mx-auto min-h-[360px] sm:min-h-[480px]"
              mode="single"
              selected={date}
              onSelect={selectDate}
            />
          </div>
        ) : (
          <div ref={miniCalRef} className="flex flex-col items-center pb-6 ">
            <div className="flex justify-between w-full mb-2">
              <button
                className="px-2 py-1 rounded "
                onClick={() =>
                  setWeekStart((prev) => {
                    const d = new Date(prev);
                    d.setDate(d.getDate() - 7);
                    return d;
                  })
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
                  setWeekStart((prev) => {
                    const d = new Date(prev);
                    d.setDate(d.getDate() + 7);
                    return d;
                  })
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
                  onClick={() => selectDate(d)}
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
      <button
        onClick={openEventModal}
        className="h-16 w-full max-w-[500px] mx-auto rounded-2xl bg-black hover:bg-[#1e1e1e] text-white flex items-center text-center justify-center gap-2"
      >
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
            <DayBlock
              date={d}
              events={getEventsForDate(d)}
              highlighted={
                !!highlightDate &&
                d.toDateString() === highlightDate.toDateString()
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
