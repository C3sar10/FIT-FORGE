"use client";
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
  X,
} from "lucide-react";
import { div } from "framer-motion/client";
import { useEvent } from "@/context/EventContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
//import type { Event } from "@/types/event";
import type { Event } from "@/types/event";
import { useDialog } from "@/context/DialogContext";
import Toast from "@/components/ui/Toast";
import { getWeekDates, getWeekDatesForSelected } from "@/utils/utils";

type Props = {};

const WeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type ScheduleBlockProps = {
  event: Event;
  onToast?: (t: {
    open: boolean;
    message: string;
    variant?: "success" | "error" | "info";
  }) => void;
};

const ScheduleBlock = ({ event, onToast }: ScheduleBlockProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const { theme, setTheme } = useTheme();
  const [isLight, setIsLight] = useState(theme === "light");
  const queryClient = useQueryClient();
  const { showDialog, closeDialog } = useDialog();

  useEffect(() => {
    setIsLight(theme === "light");
  }, [theme]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onToggle = () => setOpen((v) => !v);

  const handleDeleteEvent = async () => {
    const res = await showDialog({
      title: "Delete Event?",
      message: "Are you sure you want to delete this event?",
      actions: [
        { id: "cancel", label: "Cancel", variant: "secondary" },
        { id: "delete", label: "Delete Event", variant: "danger" },
      ],
    });
    if (res === "delete") {
      // Optimistic delete: snapshot caches, remove locally, call API, rollback on failure
      const year = new Date(event.date).getFullYear();
      const month = new Date(event.date).getMonth() + 1;

      const prevAll = queryClient.getQueryData<Event[]>(["events", "all"]);
      const prevMonth = queryClient.getQueryData<Event[]>([
        "events",
        year,
        month,
      ]);

      // remove from cache immediately
      queryClient.setQueryData<Event[] | undefined>(["events", "all"], (old) =>
        old ? old.filter((e) => e.id !== event.id) : old
      );
      queryClient.setQueryData<Event[] | undefined>(
        ["events", year, month],
        (old) => (old ? old.filter((e) => e.id !== event.id) : old)
      );

      try {
        await EventAPI.delete(event.id);
        // ensure consistency by refetching the queries
        await queryClient.invalidateQueries({
          queryKey: ["events", year, month],
        });
        await queryClient.invalidateQueries({ queryKey: ["events", "all"] });
        // show success toast via callback if provided
        if (typeof onToast === "function")
          onToast({ open: true, message: "Event deleted", variant: "success" });
      } catch (err) {
        // rollback
        queryClient.setQueryData(["events", "all"], prevAll);
        queryClient.setQueryData(["events", year, month], prevMonth);
        // show error toast via callback if provided
        if (typeof onToast === "function")
          onToast({
            open: true,
            message: "Failed to delete event",
            variant: "error",
          });
        console.error("Failed to delete event, rollback cache", err);
      } finally {
        closeDialog();
      }
    }
  };

  return (
    <div
      ref={ref}
      className="w-full h-24 bg-gradient-to-r from-lime-950 to-lime-600 border border-neutral-200 rounded-2xl flex items-center justify-between gap-4  relative cursor-pointer"
      onClick={onToggle}
    >
      <div className="h-full flex items-center gap-4 p-4">
        <div className="rounded-full aspect-square h-full flex items-center justify-center bg-lime-700 text-2xl text-white">
          W
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-lg text-white">{event.title}</span>
          <span className="text-sm text-neutral-300">{event.type}</span>
        </div>
      </div>
      <div className="h-full aspect-square w-auto bg-neutral-400 rounded-r-2xl overflow-hidden">
        <img
          src="/browse-web/running-default.webp"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {open && (
        <div
          className={`absolute right-3 top-3 z-50 w-44 ${
            isLight ? "bg-white" : "bg-[#1e1e1e]"
          } rounded-md shadow-lg border`}
        >
          <ul className="flex flex-col p-2 text-sm">
            <li className="p-2 rounded hover:bg-lime-500/50 cursor-pointer">
              Edit Event
            </li>
            <li
              onClick={handleDeleteEvent}
              className="p-2 rounded hover:bg-lime-500/50 cursor-pointer"
            >
              Delete Event
            </li>
            {event.type === "workout" &&
              event.workoutDetails?.workoutId &&
              (() => {
                const workoutId = event.workoutDetails!.workoutId as string;
                return (
                  <li
                    className="p-2 rounded hover:bg-neutral-100 cursor-pointer text-lime-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      // navigate to start workout
                      router.push(`/startworkout/${workoutId}`);
                    }}
                  >
                    Start Workout
                  </li>
                );
              })()}
          </ul>
        </div>
      )}
    </div>
  );
};
type DayBlockProps = {
  date: Date;
  events: Array<any>;
  onToast?: (t: {
    open: boolean;
    message: string;
    variant?: "success" | "error" | "info";
  }) => void;
};
const DayBlock = ({
  date,
  events,
  onToast,
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
            <ScheduleBlock event={event} key={index} onToast={onToast} />
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
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    variant?: "success" | "error" | "info";
  }>({ open: false, message: "" });

  const selectDate = (d: Date | undefined) => {
    if (!d) return;
    setDate(d);
    setHighlightDate(d);
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
      } catch (err: any) {
        console.error("Error refetching events:", err);
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
      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast({ open: false, message: "" })}
      />
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
              onToast={(t) => setToast(t)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
