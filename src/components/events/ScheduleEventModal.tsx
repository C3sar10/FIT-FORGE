"use client";
import { useDialog } from "@/context/DialogContext";
import { useEvent } from "@/context/EventContext";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EventAPI, http } from "@/lib/api";
import { X } from "lucide-react";
import Alert from "../ui/Alert";
import { useAuth } from "@/context/AuthContext";

type Props = {};

const ScheduleEventModal = (props: Props) => {
  // Workout picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [library, setLibrary] = useState<any[]>([]);
  const [libLoaded, setLibLoaded] = useState(false);
  const [q, setQ] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const { user } = useAuth();

  // Load workouts from library (all + custom)
  const loadLibrary = async () => {
    try {
      const data = await http.get<{ items: any[]; nextCursor: string | null }>(
        "/workouts?scope=all&limit=50"
      );

      // Normalize items: some custom workouts may come with `_id` instead of `id`
      const normalized = (data.items || []).map((w: any) => ({
        ...w,
        id: w.id || w._id || w.workoutId || undefined,
      }));

      setLibrary(normalized);
      setLibLoaded(true);
    } catch (e) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    if (pickerOpen && !libLoaded) loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen]);

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return library;
    return library.filter((w) => w.name.toLowerCase().includes(qq));
  }, [library, q]);
  const { theme } = useTheme();
  const [isLight, setIsLight] = React.useState(theme === "light");
  const { eventModalOpen, openEventModal, closeEventModal } = useEvent();
  const { showDialog } = useDialog();

  const [selectValue, setSelectValue] = useState("workout");
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsLight(theme === "light");
  }, [theme]);

  const handleDiscard = async () => {
    const result = await showDialog({
      title: "Discard Schedule?",
      message:
        "Are you sure you want to leave? Your schedule will not be saved.",
      actions: [
        { id: "stay", label: "Stay", variant: "secondary" },
        { id: "confirm", label: "Discard", variant: "danger" },
      ],
    });
    if (result === "confirm") {
      // reset form
      setSelectValue("workout");
      setDateValue("");
      setTimeValue("");
      setSelectedWorkout(null);
      setQ("");
      setErrorMsg(null);
      closeEventModal();
    }
    // else do nothing, stay in log
  };

  const queryClient = useQueryClient();
  const handleSave = async () => {
    try {
      if (selectValue === "workout" && !selectedWorkout) {
        throw new Error("Please select a workout");
      }
      if (!dateValue) {
        throw new Error("Please select a date");
      }
      if (!timeValue) {
        throw new Error("Please select a time");
      }
      // Confirm save

      const result = await showDialog({
        title: "Schedule Event?",
        message: "Are you sure you want to schedule this event?",
        actions: [
          { id: "cancel", label: "Cancel", variant: "secondary" },
          { id: "save", label: "Schedule Event", variant: "primary" },
        ],
      });
      if (result === "save") {
        // Save event to DB
        const payload = {
          title:
            selectValue === "workout"
              ? selectedWorkout.name + " (Scheduled)"
              : "Scheduled Event",
          //author: user?.id || "",
          type: selectValue === "workout" ? "workout" : "log",
          date: new Date(`${dateValue}T${timeValue}`),
          workoutDetails: {
            workoutId:
              selectValue === "workout" ? selectedWorkout.id : undefined,
            name: selectValue === "workout" ? selectedWorkout.name : undefined,
            notes: "",
            // ensure we don't send `null` for image (z.string().optional() does not accept null)
            image:
              selectValue === "workout"
                ? selectedWorkout.image == null
                  ? undefined
                  : selectedWorkout.image
                : undefined,
          },
          logDetails:
            selectValue === "log"
              ? {
                  logId: "",
                  summary: "Scheduled Log",
                  notes: "",
                }
              : {
                  logId: "",
                  summary: "",
                  notes: "",
                },
          tags: [],
          description: "",
          completed: false,
        };

        try {
          await EventAPI.create(payload);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("Event create failed:", err);
        }

        // Invalidate calendar events query for current month
        const year = new Date(dateValue).getFullYear();
        const month = new Date(dateValue).getMonth() + 1;
        await queryClient.invalidateQueries({
          queryKey: ["events", year, month],
        });
        // Also invalidate the broad 'all events' session cache so ScheduleCalendar updates
        await queryClient.invalidateQueries({ queryKey: ["events", "all"] });
        // reset form
        setSelectValue("workout");
        setDateValue("");
        setTimeValue("");
        setSelectedWorkout(null);
        setQ("");
        setErrorMsg(null);

        closeEventModal();
      }
      // else do nothing, stay in log
    } catch (error) {
      console.error("Error scheduling event:", error);
      setErrorMsg("Failed to schedule event: " + (error as Error).message);
    }
  };

  return (
    <div
      className={`
    ${eventModalOpen ? "block" : "hidden"}
     w-screen h-screen fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4`}
    >
      <Alert
        open={!!errorMsg}
        onClose={() => setErrorMsg(null)}
        title="Oops!"
        message={errorMsg ?? ""}
        variant="error"
        autoCloseMs={4000}
      />
      <div
        className={`flex flex-col items-center w-full max-w-[600px] h-[80vh] min-h-[600px] overflow-y-auto p-4 py-8 border border-neutral-200 ${
          isLight ? "bg-white" : "bg-[#1e1e1e]"
        } rounded-2xl p-6 flex flex-col gap-4`}
      >
        <h2 className="text-2xl font-medium md:text-4xl">Schedule Event</h2>
        <form className="flex flex-col gap-4 w-full py-4 flex-1 max-w-[500px]">
          <div className="w-full flex flex-col items-start">
            <label>Event Type</label>
            <select
              onChange={(e) => setSelectValue(e.target.value)}
              className="input w-full px-4 py-2 rounded-md border border-neutral-200 bg-transparent focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
            >
              <option value="workout">Workout</option>
              <option value="meeting">Log</option>
              <option value="other">Other</option>
            </select>
          </div>
          {selectValue === "workout" && (
            <div className="w-full flex flex-col items-start">
              <label>Workout</label>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="w-full h-12 rounded-2xl bg-black hover:bg-[#1e1e1e] text-white flex items-center justify-center gap-2 mb-2"
              >
                Pick Workout
              </button>
              {selectedWorkout && (
                <div className="w-full flex items-center gap-3 border border-neutral-200 rounded-xl p-3 mt-2">
                  <div className="w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden">
                    {selectedWorkout.image ? (
                      <img
                        src={selectedWorkout.image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {selectedWorkout.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {(selectedWorkout.tags ?? []).slice(0, 3).join(" · ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="h-8 px-3 rounded-lg bg-neutral-700 text-white text-xs hover:bg-neutral-600"
                    onClick={() => setSelectedWorkout(null)}
                  >
                    Remove
                  </button>
                </div>
              )}
              {/* Workout Picker Modal */}
              {pickerOpen && (
                <div className="fixed inset-0 z-[120]">
                  <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setPickerOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center px-4 sm:px-6"
                    role="dialog"
                    aria-modal="true"
                  >
                    <div className="w-full max-w-3xl rounded-2xl bg-neutral-900 text-white p-4 sm:p-6 border border-neutral-800 shadow-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold">
                          Pick Workout
                        </h2>
                        <button
                          onClick={() => setPickerOpen(false)}
                          className="rounded-lg p-2 hover:bg-neutral-800"
                        >
                          <X className="size-5" />
                        </button>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <input
                          className="flex-1 h-10 rounded-xl border border-neutral-700 bg-neutral-800 px-3"
                          placeholder="Search by name…"
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                        {filtered.map((w) => {
                          const already = selectedWorkout?.id === w.id;
                          return (
                            <div
                              key={w.id}
                              className={`flex items-center gap-3 border border-neutral-800 rounded-xl p-3 bg-neutral-900 ${
                                already ? "opacity-50" : ""
                              }`}
                            >
                              <div className="w-14 h-14 bg-neutral-200 rounded-lg overflow-hidden">
                                {w.image ? (
                                  <img
                                    src={w.image}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-neutral-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {w.name}
                                </p>
                                <p className="text-[11px] text-neutral-400 truncate">
                                  {(w.tags ?? []).slice(0, 3).join(" · ")}
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={!!selectedWorkout}
                                onClick={() => setSelectedWorkout(w)}
                                className={`h-8 px-3 rounded-lg text-xs ${
                                  !!selectedWorkout
                                    ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                                    : "bg-lime-600 hover:bg-lime-500 text-white"
                                }`}
                              >
                                {already ? "Selected" : "Select"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          onClick={() => setPickerOpen(false)}
                          className="h-10 px-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white text-sm"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Workout Picker Modal */}
          {pickerOpen && (
            <div className="fixed inset-0 z-[120]">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setPickerOpen(false)}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 flex items-center justify-center px-4 sm:px-6"
                role="dialog"
                aria-modal="true"
              >
                <div className="w-full max-w-3xl rounded-2xl bg-neutral-900 text-white p-4 sm:p-6 border border-neutral-800 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold">
                      Pick Workout
                    </h2>
                    <button
                      onClick={() => setPickerOpen(false)}
                      className="rounded-lg p-2 hover:bg-neutral-800"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      className="flex-1 h-10 rounded-xl border border-neutral-700 bg-neutral-800 px-3"
                      placeholder="Search by name…"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                    {library.map((w) => {
                      const already = selectedWorkout?.id === w.id;
                      return (
                        <div
                          key={w.id}
                          className={`flex items-center gap-3 border border-neutral-800 rounded-xl p-3 bg-neutral-900 ${
                            already ? "opacity-50" : ""
                          }`}
                        >
                          <div className="w-14 h-14 bg-neutral-200 rounded-lg overflow-hidden">
                            {w.image ? (
                              <img
                                src={w.image}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-neutral-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {w.name}
                            </p>
                            <p className="text-[11px] text-neutral-400 truncate">
                              {(w.tags ?? []).slice(0, 3).join(" · ")}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={!!selectedWorkout}
                            onClick={() => setSelectedWorkout(w)}
                            className={`h-8 px-3 rounded-lg text-xs ${
                              !!selectedWorkout
                                ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                                : "bg-lime-600 hover:bg-lime-500 text-white"
                            }`}
                          >
                            {already ? "Selected" : "Select"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => setPickerOpen(false)}
                      className="h-10 px-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white text-sm"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="w-full flex items-center gap-4">
            <label>Date</label>
            <input
              onChange={(e) => setDateValue(e.target.value)}
              type="date"
              className="input px-4 py-2 border border-neutral-200 rounded-md"
            />
          </div>
          <div className="w-full flex items-center gap-4">
            <label>Time</label>
            <input
              onChange={(e) => setTimeValue(e.target.value)}
              type="time"
              className="input px-4 py-2 border border-neutral-200 rounded-md"
            />
          </div>

          <div className="w-full p-4 flex items-center gap-4 justify-end">
            <button
              type="button"
              className="p-4 px-6 rounded-md bg-red-700 text-white tracking-wider  hover:bg-red-900"
              onClick={handleDiscard}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="p-4 px-6 rounded-md bg-lime-700 text-white tracking-wider  hover:bg-lime-500"
            >
              Schedule Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleEventModal;
