"use client";
import Alert from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";
import { useDialog } from "@/context/DialogContext";
import { http } from "@/lib/api";
import { ExerciseType } from "@/types/workout";
import { stringList } from "aws-sdk/clients/datapipeline";
import { randomUUID } from "crypto";
import { ArrowLeft, ArrowRight, CheckCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";

import React, { useState } from "react";

type Props = {};

interface FormPagesProps {
  type: "create exercise" | "create workout";
  errorMessage: string | null;
  setErrorMessage: (arg0: string) => void;
}

const FormPages: React.FC<FormPagesProps> = ({
  type,
  errorMessage,
  setErrorMessage,
}) => {
  const [currPage, setCurrPage] = useState(1);
  const { showDialog } = useDialog();
  const router = useRouter();
  const { user } = useAuth();

  if (type === "create exercise") {
    const [exerTitle, setExerTitle] = useState("");
    const [exerType, setExerType] = useState<string>("");
    const [exerDescription, setExerDescription] = useState("");
    const [exerTags, setExerTags] = useState<string[]>([]);
    const [exerTag, setExerTag] = useState<string>("");
    // page 2 variables - Enhanced for v2
    const [numSets, setNumSets] = useState(0);
    const [reps, setReps] = useState("");
    const [restSecs, setRestSecs] = useState(0);
    const [equipList, setEquipList] = useState<string[]>([]);
    const [newEquip, setNewEquip] = useState("");

    // New v2 fields
    const [repType, setRepType] = useState<string>("number");
    const [repNumber, setRepNumber] = useState<number>(0);
    const [repRange, setRepRange] = useState({ min: 0, max: 0 });
    const [repDuration, setRepDuration] = useState({
      time: 0,
      unit: "seconds",
    });
    const [repDistance, setRepDistance] = useState({
      distance: 0,
      unit: "meters",
    });
    const [timeRange, setTimeRange] = useState({
      min: { time: 0, unit: "seconds" },
      max: { time: 0, unit: "seconds" },
    });
    const [restTimeSets, setRestTimeSets] = useState({
      time: 0,
      unit: "seconds",
    });
    const [restTimeReps, setRestTimeReps] = useState({
      time: 0,
      unit: "seconds",
    });
    const [targetMetric, setTargetMetric] = useState({
      type: "",
      unit: "",
      number: 0,
      name: "",
    });

    const handleAddNewTag = () => {
      if (exerTag === "" || exerTags.length >= 5 || exerTags.includes(exerTag))
        return;
      setExerTags([...exerTags, exerTag]);
      setExerTag("");
    };

    const handleDeleteTag = (tagName: string) => {
      if (exerTags.includes(tagName)) {
        let newTags = exerTags.filter((element) => element !== tagName);
        setExerTags(newTags);
      }
    };

    const handleAddEquipment = () => {
      if (
        newEquip === "" ||
        equipList.length > 3 ||
        equipList.includes(newEquip)
      )
        return;
      setEquipList([...equipList, newEquip]);
      setNewEquip("");
    };

    const handleDeleteEquip = (equip: string) => {
      if (equipList.includes(equip)) {
        let newEquipList = equipList.filter((item) => item !== equip);
        setEquipList(newEquipList);
      }
    };

    const handleNextStep = () => {
      if (currPage === 1) {
        try {
          if (exerTitle === "") throw new Error("Missing Exercise Title.");
          if (exerDescription === "")
            throw new Error("Missing Exercise Description.");
          else {
            setCurrPage(currPage + 1);
          }
        } catch (error: any) {
          setErrorMessage(error?.message || "Something went wrong");
        }
      } else if (currPage === 2) {
        try {
          if (numSets <= 0)
            throw new Error("Sets can't be less than or equal to 0.");

          // Validate based on rep type
          if (repType === "number" && repNumber <= 0)
            throw new Error("Rep number must be greater than 0.");
          if (
            repType === "repRange" &&
            (repRange.min <= 0 ||
              repRange.max <= 0 ||
              repRange.min >= repRange.max)
          )
            throw new Error(
              "Rep range must have valid min and max values (min < max, both > 0)."
            );
          if (repType === "duration" && repDuration.time <= 0)
            throw new Error("Duration must be greater than 0.");
          if (repType === "distance" && repDistance.distance <= 0)
            throw new Error("Distance must be greater than 0.");
          if (
            repType === "timeRange" &&
            (timeRange.min.time <= 0 ||
              timeRange.max.time <= 0 ||
              timeRange.min.time >= timeRange.max.time)
          )
            throw new Error("Time range must have valid min and max values.");
          if (repType === "other" && reps === "")
            throw new Error("Please provide a rep description.");

          if (restTimeSets.time < 0 || restTimeReps.time < 0)
            throw new Error("Rest time cannot be negative.");

          // Update legacy restSecs for backward compatibility
          setRestSecs(restTimeSets.time || 60);

          setCurrPage(currPage + 1);
        } catch (error: any) {
          setErrorMessage(error?.message || "Something went wrong");
        }
      }
    };

    const handleCancelExit = async () => {
      const res = await showDialog({
        title: "Exit & Save Changes?",
        message:
          "Do you want to save your custom exercise progress as a draft?",
        actions: [
          { id: "save", label: "Yes, Save Draft", variant: "primary" },
          { id: "close", label: "No, Discard Changes", variant: "danger" },
        ],
      });
      if (res === "save") {
      }
      router.back();
    };

    const handleSubmitForm = async () => {
      try {
        const createdExer = await http.post<{ id: string }>("/exercises", {
          author: user?.name,
          title: exerTitle,
          type: exerType ?? "other",
          tags: exerTags,
          description: exerDescription,
          details: {
            sets: numSets,
            reps: reps,
            restSecs: restSecs,
            equipment: equipList,
            // v2 Enhanced fields
            repType: repType,
            repNumber: repType === "number" ? repNumber : undefined,
            repRange: repType === "repRange" ? repRange : undefined,
            timeRange: repType === "timeRange" ? timeRange : undefined,
            repDuration: repType === "duration" ? repDuration : undefined,
            repDistance: repType === "distance" ? repDistance : undefined,
            restTimeSets: restTimeSets.time > 0 ? restTimeSets : undefined,
            restTimeReps: restTimeReps.time > 0 ? restTimeReps : undefined,
            targetMetric: targetMetric.type ? targetMetric : undefined,
          },
          schemaVersion: 2, // Mark as v2 exercise
        });

        if (createdExer.id) {
          await showDialog({
            title: "Exercise Created Successfully",
            message: "You can now see it from your library. ",
            actions: [{ id: "ok", label: "Go to Library", variant: "primary" }],
          });
          router.push("/dash/workouts");
          router.refresh();
        }
      } catch (error: any) {
        console.log("Error: ", error);
        setErrorMessage(error?.message || "Something went wrong");
      }
    };

    switch (currPage) {
      case 1:
        return (
          <>
            <div className="w-full p-4 flex items-center max-w-[500px] mx-auto justify-center gap-2">
              <span className="size-8 rounded-full border border-neutral-200 flex items-center justify-center ">
                {currPage}
              </span>
              <h1 className="text-lg md:text-2xl font-medium">
                Custom Exercise Builder
              </h1>
            </div>
            <ul className="w-full flex flex-col items-center gap-4">
              <li className="w-full flex flex-col relative items-start gap-1">
                <label
                  htmlFor="exerciseTitle"
                  className="text-base font-medium"
                >
                  Exercise Title
                </label>
                <input
                  required
                  value={exerTitle}
                  onChange={(e) => setExerTitle(e.target.value)}
                  type="text"
                  name="exerciseTitle"
                  id="exerciseTitle"
                  className="w-full h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                />
              </li>
              <li className="w-full flex flex-col relative items-start gap-1">
                <label htmlFor="exerciseType" className="text-base font-medium">
                  Type
                </label>
                <select
                  onChange={(e) => setExerType(e.target.value)}
                  id="exerciseType"
                  name="exerciseType"
                  className="w-full h-12 rounded-2xl px-4 py-2 border border-neutral-200"
                  defaultValue={"strength"}
                >
                  <option value={"strength"}>Strength</option>
                  <option value={"endurance"}>Endurance</option>
                  <option value={"sport"}>Sport</option>
                  <option value={"speed"}>Speed</option>
                  <option value={"other"}>Other</option>
                </select>
              </li>
              <li className="w-full flex flex-col relative items-start gap-1">
                <label
                  htmlFor="exerciseDescription"
                  className="text-base font-medium"
                >
                  Description
                </label>
                <textarea
                  required
                  value={exerDescription}
                  onChange={(e) => setExerDescription(e.target.value)}
                  rows={4}
                  cols={5}
                  name="exerciseDescription"
                  id="exerciseDescription"
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                ></textarea>
              </li>
              <li className="w-full flex flex-col relative items-start gap-1">
                <label htmlFor="exerciseTags" className="text-base font-medium">
                  Tags
                </label>
                <input
                  value={exerTag}
                  onChange={(e) => setExerTag(e.target.value)}
                  type="text"
                  name="exerciseTags"
                  id="exerciseTags"
                  className="w-full h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base relative"
                ></input>
                <div className="w-full flex gap-4 items-center mt-1">
                  <button
                    type="button"
                    className="h-8 text-xs bg-neutral-500 hover:bg-neutral-400 text-white px-4 w-fit rounded-xl"
                    onClick={handleAddNewTag}
                  >
                    Add Tag
                  </button>
                  {exerTags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs p-2 bg-black text-white border border-neutral-200 rounded-md capitalize flex items-center justify-center"
                    >
                      <X
                        onClick={(e) => handleDeleteTag(tag)}
                        className="size-3 mr-1 text-neutral-400 hover:text-neutral-200"
                      />
                      {tag}
                    </span>
                  ))}
                </div>
              </li>
              <li className="w-full flex flex-col relative mt-6 items-center">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full max-w-[450px] p-4 rounded-2xl bg-black hover:bg-[#1e1e1e] text-white cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <span>Next Step</span>
                  <ArrowRight className="text-white size-6" />
                </button>
              </li>
              <li className="w-full flex flex-col relative items-center">
                <button
                  onClick={handleCancelExit}
                  type="button"
                  className="w-full max-w-[450px] p-4 rounded-2xl border border-neutral-200 text-red-500 cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <span>Exit</span>
                </button>
              </li>
            </ul>
          </>
        );
      case 2:
        return (
          <>
            <div className="w-full p-4 flex items-center max-w-[500px] mx-auto justify-center gap-2">
              <span className="size-8 rounded-full border border-neutral-200 flex items-center justify-center ">
                {currPage}
              </span>
              <h1 className="text-lg md:text-2xl font-medium">
                Custom Exercise Builder
              </h1>
            </div>
            <ul className="w-full flex flex-col items-center gap-4">
              {/* Exercise Structure Section */}
              <li className="w-full">
                <h3 className="text-lg font-semibold text-neutral-700 mb-3 border-b border-neutral-200 pb-2">
                  Exercise Structure
                </h3>
              </li>
              <li className="w-full flex flex-col relative items-start gap-1">
                <label htmlFor="numSets" className="text-base font-medium">
                  Number of Sets
                </label>
                <input
                  required
                  value={numSets}
                  onChange={(e) => setNumSets(Number(e.target.value))}
                  type="number"
                  name="numSets"
                  id="numSets"
                  className="w-full h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                />
              </li>
              <li className="w-full flex flex-col relative items-start gap-1">
                <label htmlFor="repType" className="text-base font-medium">
                  Rep Type
                </label>
                <select
                  value={repType}
                  onChange={(e) => setRepType(e.target.value)}
                  id="repType"
                  name="repType"
                  className="w-full h-12 rounded-2xl px-4 py-2 border border-neutral-200"
                >
                  <option value="number">Fixed Number</option>
                  <option value="repRange">Rep Range</option>
                  <option value="duration">Duration (Time-based)</option>
                  <option value="distance">Distance</option>
                  <option value="timeRange">Time Range</option>
                  <option value="other">Other</option>
                </select>
              </li>

              {/* Conditional Rep Input based on repType */}
              {repType === "number" && (
                <li className="w-full flex flex-col relative items-start gap-1">
                  <label htmlFor="repNumber" className="text-base font-medium">
                    Number of Reps
                  </label>
                  <input
                    value={repNumber}
                    onChange={(e) => setRepNumber(Number(e.target.value))}
                    type="number"
                    name="repNumber"
                    id="repNumber"
                    className="w-full h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                  />
                </li>
              )}

              {repType === "repRange" && (
                <li className="w-full flex flex-col relative items-start gap-1">
                  <label className="text-base font-medium">Rep Range</label>
                  <div className="w-full flex gap-2 items-center">
                    <input
                      value={repRange.min}
                      onChange={(e) =>
                        setRepRange({
                          ...repRange,
                          min: Number(e.target.value),
                        })
                      }
                      type="number"
                      placeholder="Min"
                      className="flex-1 h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                    />
                    <span className="text-neutral-500">to</span>
                    <input
                      value={repRange.max}
                      onChange={(e) =>
                        setRepRange({
                          ...repRange,
                          max: Number(e.target.value),
                        })
                      }
                      type="number"
                      placeholder="Max"
                      className="flex-1 h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                    />
                  </div>
                </li>
              )}

              {repType === "duration" && (
                <li className="w-full flex flex-col relative items-start gap-1">
                  <label className="text-base font-medium">Duration</label>
                  <div className="w-full flex gap-2 items-center">
                    <input
                      value={repDuration.time}
                      onChange={(e) =>
                        setRepDuration({
                          ...repDuration,
                          time: Number(e.target.value),
                        })
                      }
                      type="number"
                      placeholder="Time"
                      className="flex-1 h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                    />
                    <select
                      value={repDuration.unit}
                      onChange={(e) =>
                        setRepDuration({ ...repDuration, unit: e.target.value })
                      }
                      className="w-32 h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                    >
                      <option value="seconds">Seconds</option>
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                </li>
              )}

              {repType === "distance" && (
                <li className="w-full flex flex-col relative items-start gap-1">
                  <label className="text-base font-medium">Distance</label>
                  <div className="w-full flex gap-2 items-center">
                    <input
                      value={repDistance.distance}
                      onChange={(e) =>
                        setRepDistance({
                          ...repDistance,
                          distance: Number(e.target.value),
                        })
                      }
                      type="number"
                      placeholder="Distance"
                      className="flex-1 h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                    />
                    <select
                      value={repDistance.unit}
                      onChange={(e) =>
                        setRepDistance({ ...repDistance, unit: e.target.value })
                      }
                      className="w-32 h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                    >
                      <option value="meters">Meters</option>
                      <option value="kilometers">Kilometers</option>
                      <option value="miles">Miles</option>
                      <option value="yards">Yards</option>
                      <option value="feet">Feet</option>
                    </select>
                  </div>
                </li>
              )}

              {repType === "timeRange" && (
                <li className="w-full flex flex-col relative items-start gap-1">
                  <label className="text-base font-medium">Time Range</label>
                  <div className="w-full flex gap-2 items-center mb-2">
                    <div className="flex-1 flex gap-1 items-center">
                      <span className="text-sm text-neutral-600">Min:</span>
                      <input
                        value={timeRange.min.time}
                        onChange={(e) =>
                          setTimeRange({
                            ...timeRange,
                            min: {
                              ...timeRange.min,
                              time: Number(e.target.value),
                            },
                          })
                        }
                        type="number"
                        placeholder="Min time"
                        className="flex-1 h-10 rounded-xl border border-neutral-200 px-3 py-1 text-sm"
                      />
                      <select
                        value={timeRange.min.unit}
                        onChange={(e) =>
                          setTimeRange({
                            ...timeRange,
                            min: { ...timeRange.min, unit: e.target.value },
                          })
                        }
                        className="w-24 h-10 rounded-xl border border-neutral-200 px-2 py-1 text-sm"
                      >
                        <option value="seconds">sec</option>
                        <option value="minutes">min</option>
                      </select>
                    </div>
                  </div>
                  <div className="w-full flex gap-2 items-center">
                    <div className="flex-1 flex gap-1 items-center">
                      <span className="text-sm text-neutral-600">Max:</span>
                      <input
                        value={timeRange.max.time}
                        onChange={(e) =>
                          setTimeRange({
                            ...timeRange,
                            max: {
                              ...timeRange.max,
                              time: Number(e.target.value),
                            },
                          })
                        }
                        type="number"
                        placeholder="Max time"
                        className="flex-1 h-10 rounded-xl border border-neutral-200 px-3 py-1 text-sm"
                      />
                      <select
                        value={timeRange.max.unit}
                        onChange={(e) =>
                          setTimeRange({
                            ...timeRange,
                            max: { ...timeRange.max, unit: e.target.value },
                          })
                        }
                        className="w-24 h-10 rounded-xl border border-neutral-200 px-2 py-1 text-sm"
                      >
                        <option value="seconds">sec</option>
                        <option value="minutes">min</option>
                      </select>
                    </div>
                  </div>
                </li>
              )}

              {repType === "other" && (
                <li className="w-full flex flex-col relative items-start gap-1">
                  <label htmlFor="reps" className="text-base font-medium">
                    Reps Description
                  </label>
                  <input
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    type="text"
                    name="reps"
                    id="reps"
                    placeholder="e.g., 'Hold until failure', '3x10', etc."
                    className="w-full h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                  />
                </li>
              )}
              {/* Rest & Targets Section */}
              <li className="w-full mt-6">
                <h3 className="text-lg font-semibold text-neutral-700 mb-3 border-b border-neutral-200 pb-2">
                  Rest & Performance Targets
                </h3>
              </li>

              {/* Enhanced Rest Time Section */}
              <li className="w-full flex flex-col relative items-start gap-2">
                <label className="text-base font-medium">Rest Time</label>
                <div className="w-full space-y-2">
                  {/* Rest Between Sets */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-600 min-w-[120px]">
                      Between Sets:
                    </label>
                    <input
                      value={restTimeSets.time}
                      onChange={(e) =>
                        setRestTimeSets({
                          ...restTimeSets,
                          time: Number(e.target.value),
                        })
                      }
                      type="number"
                      placeholder="60"
                      className="flex-1 h-10 rounded-xl border border-neutral-200 px-3 py-1 text-sm"
                    />
                    <select
                      value={restTimeSets.unit}
                      onChange={(e) =>
                        setRestTimeSets({
                          ...restTimeSets,
                          unit: e.target.value,
                        })
                      }
                      className="w-24 h-10 rounded-xl border border-neutral-200 px-2 py-1 text-sm"
                    >
                      <option value="seconds">sec</option>
                      <option value="minutes">min</option>
                    </select>
                  </div>

                  {/* Rest Between Reps (for advanced exercises) */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-600 min-w-[120px]">
                      Between Reps:
                    </label>
                    <input
                      value={restTimeReps.time}
                      onChange={(e) =>
                        setRestTimeReps({
                          ...restTimeReps,
                          time: Number(e.target.value),
                        })
                      }
                      type="number"
                      placeholder="0"
                      className="flex-1 h-10 rounded-xl border border-neutral-200 px-3 py-1 text-sm"
                    />
                    <select
                      value={restTimeReps.unit}
                      onChange={(e) =>
                        setRestTimeReps({
                          ...restTimeReps,
                          unit: e.target.value,
                        })
                      }
                      className="w-24 h-10 rounded-xl border border-neutral-200 px-2 py-1 text-sm"
                    >
                      <option value="seconds">sec</option>
                      <option value="minutes">min</option>
                    </select>
                  </div>

                  {/* Legacy rest seconds for backward compatibility */}
                  <input
                    type="hidden"
                    value={restSecs}
                    onChange={(e) => setRestSecs(Number(e.target.value))}
                  />
                </div>
              </li>

              {/* Target Metric Section */}
              <li className="w-full flex flex-col relative items-start gap-2">
                <label className="text-base font-medium">
                  Target Metric (Optional)
                </label>
                <p className="text-sm text-neutral-600 mb-2">
                  Set a target for users to aim for (e.g., weight, speed,
                  distance)
                </p>
                <div className="w-full space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={targetMetric.type}
                      onChange={(e) =>
                        setTargetMetric({
                          ...targetMetric,
                          type: e.target.value,
                        })
                      }
                      className="flex-1 h-10 rounded-xl border border-neutral-200 px-3 py-1 text-sm"
                    >
                      <option value="">No Target</option>
                      <option value="weight">Weight</option>
                      <option value="speed">Speed</option>
                      <option value="distance">Distance</option>
                      <option value="time">Time</option>
                      <option value="heartRate">Heart Rate</option>
                      <option value="power">Power</option>
                      <option value="other">Other</option>
                    </select>
                    {targetMetric.type && (
                      <input
                        value={targetMetric.name}
                        onChange={(e) =>
                          setTargetMetric({
                            ...targetMetric,
                            name: e.target.value,
                          })
                        }
                        type="text"
                        placeholder="Metric name"
                        className="flex-1 h-10 rounded-xl border border-neutral-200 px-3 py-1 text-sm"
                      />
                    )}
                  </div>

                  {targetMetric.type && (
                    <div className="flex gap-2">
                      <input
                        value={targetMetric.number}
                        onChange={(e) =>
                          setTargetMetric({
                            ...targetMetric,
                            number: Number(e.target.value),
                          })
                        }
                        type="number"
                        placeholder="Target value"
                        className="flex-1 h-10 rounded-xl border border-neutral-200 px-3 py-1 text-sm"
                      />
                      <input
                        value={targetMetric.unit}
                        onChange={(e) =>
                          setTargetMetric({
                            ...targetMetric,
                            unit: e.target.value,
                          })
                        }
                        type="text"
                        placeholder="Unit (lbs, mph, etc.)"
                        className="w-32 h-10 rounded-xl border border-neutral-200 px-3 py-1 text-sm"
                      />
                    </div>
                  )}
                </div>
              </li>
              <li className="w-full flex flex-col relative items-start gap-1">
                <label
                  htmlFor="exerciseEquipment"
                  className="text-base font-medium"
                >
                  Equipment
                </label>
                <input
                  value={newEquip}
                  onChange={(e) => setNewEquip(e.target.value)}
                  type="text"
                  name="exerciseEquipment"
                  id="exerciseEquipment"
                  className="w-full h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base relative"
                ></input>
                <div className="w-full flex gap-4 items-center mt-1">
                  <button
                    type="button"
                    className="h-8 text-xs bg-neutral-500 hover:bg-neutral-400 text-white px-4 w-fit rounded-xl"
                    onClick={handleAddEquipment}
                  >
                    Add Equipment
                  </button>
                  {equipList.map((equipment, index) => (
                    <span
                      key={index}
                      className="text-xs p-2 bg-black text-white border border-neutral-200 rounded-md capitalize flex items-center justify-center"
                    >
                      <X
                        onClick={(e) => handleDeleteEquip(equipment)}
                        className="size-3 mr-1 text-neutral-400 hover:text-neutral-200"
                      />
                      {equipment}
                    </span>
                  ))}
                </div>
              </li>
              <li className="w-full flex flex-col relative mt-6 items-center">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full max-w-[450px] p-4 rounded-2xl bg-black hover:bg-[#1e1e1e] text-white cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <span>Next Step</span>
                  <ArrowRight className="text-white size-6" />
                </button>
              </li>
              <li className="w-full flex flex-col relative items-center">
                <button
                  type="button"
                  onClick={() => setCurrPage(currPage - 1)}
                  className="w-full max-w-[450px] p-4 rounded-2xl border border-neutral-200 cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="text-white size-6" />
                  <span>Previous Step</span>
                </button>
              </li>
              <li className="w-full flex flex-col relative items-center">
                <button
                  onClick={handleCancelExit}
                  type="button"
                  className="w-full max-w-[450px] p-4 rounded-2xl border border-neutral-200 text-red-500 cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <span>Exit</span>
                </button>
              </li>
            </ul>
          </>
        );
      case 3:
        return (
          <>
            <div className="w-full p-4 flex items-center max-w-[500px] mx-auto justify-center gap-2">
              <span className="size-8 rounded-full border border-neutral-200 flex items-center justify-center ">
                {currPage}
              </span>
              <h1 className="text-lg md:text-2xl font-medium">
                Review Your Exercise
              </h1>
            </div>
            <ul className="w-full flex flex-col items-center gap-4">
              <li className="w-full flex flex-col relative items-start gap-1">
                <p className="font-medium text-base">Exercise Title</p>
                <p className="text-2xl">{exerTitle}</p>
              </li>
              <li className="w-full flex flex-col relative items-start gap-1">
                <p className="font-medium text-base">Exercise Type</p>
                <p className="text-2xl">{exerType}</p>
              </li>
              <li className="w-full flex flex-col relative items-start gap-1">
                <p className="font-medium text-base">Description</p>
                <p className="text-2xl">{exerDescription}</p>
              </li>
              <li className="w-full flex flex-col relative items-start gap-1">
                <p className="font-medium text-base">Tags</p>
                <div className="w-full flex gap-4 items-center mt-1">
                  {exerTags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-sm p-2 bg-black text-white border border-neutral-200 rounded-md capitalize flex items-center justify-center"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </li>
              <li className="w-full flex flex-col relative items-start gap-1">
                <p className="font-medium text-base">Sets</p>
                <p className="text-2xl">{numSets.toString()}</p>
              </li>
              <li className="w-full flex flex-col relative items-start gap-1">
                <p className="font-medium text-base">Rep Configuration</p>
                <div className="space-y-2">
                  <p className="text-lg capitalize">
                    <strong>Type:</strong>{" "}
                    {repType.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </p>
                  {repType === "number" && (
                    <p className="text-lg">
                      <strong>Reps:</strong> {repNumber}
                    </p>
                  )}
                  {repType === "repRange" && (
                    <p className="text-lg">
                      <strong>Range:</strong> {repRange.min} - {repRange.max}{" "}
                      reps
                    </p>
                  )}
                  {repType === "duration" && (
                    <p className="text-lg">
                      <strong>Duration:</strong> {repDuration.time}{" "}
                      {repDuration.unit}
                    </p>
                  )}
                  {repType === "distance" && (
                    <p className="text-lg">
                      <strong>Distance:</strong> {repDistance.distance}{" "}
                      {repDistance.unit}
                    </p>
                  )}
                  {repType === "timeRange" && (
                    <p className="text-lg">
                      <strong>Time Range:</strong> {timeRange.min.time}{" "}
                      {timeRange.min.unit} - {timeRange.max.time}{" "}
                      {timeRange.max.unit}
                    </p>
                  )}
                  {repType === "other" && (
                    <p className="text-lg">
                      <strong>Description:</strong> {reps}
                    </p>
                  )}
                </div>
              </li>
              <li className="w-full flex flex-col relative items-start gap-1">
                <p className="font-medium text-base">Rest Time</p>
                <div className="space-y-1">
                  {restTimeSets.time > 0 && (
                    <p className="text-lg">
                      <strong>Between Sets:</strong> {restTimeSets.time}{" "}
                      {restTimeSets.unit}
                    </p>
                  )}
                  {restTimeReps.time > 0 && (
                    <p className="text-lg">
                      <strong>Between Reps:</strong> {restTimeReps.time}{" "}
                      {restTimeReps.unit}
                    </p>
                  )}
                  {restTimeSets.time === 0 && restTimeReps.time === 0 && (
                    <p className="text-lg text-neutral-500">
                      No rest time specified
                    </p>
                  )}
                </div>
              </li>
              {targetMetric.type && (
                <li className="w-full flex flex-col relative items-start gap-1">
                  <p className="font-medium text-base">Target Metric</p>
                  <div className="p-3 bg-lime-50 border border-lime-200 rounded-lg">
                    <p className="text-lg">
                      <strong>{targetMetric.name || targetMetric.type}:</strong>{" "}
                      {targetMetric.number} {targetMetric.unit}
                    </p>
                  </div>
                </li>
              )}
              <li className="w-full flex flex-col relative items-start gap-1">
                <p className="font-medium text-base">Equipment</p>
                <div className="w-full flex gap-4 items-center mt-1">
                  {equipList.map((equip, index) => (
                    <span
                      key={index}
                      className="text-sm p-2 bg-black text-white border border-neutral-200 rounded-md capitalize flex items-center justify-center"
                    >
                      {equip}
                    </span>
                  ))}
                </div>
              </li>
              <li className="w-full flex flex-col relative mt-6 items-center">
                <button
                  onClick={handleSubmitForm}
                  type="button"
                  className="w-full max-w-[450px] p-4 rounded-2xl bg-lime-500 hover:bg-lime-700 text-white cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <span>Create Exercise</span>
                  <CheckCheck className="text-white size-6" />
                </button>
              </li>
              <li className="w-full flex flex-col relative items-center">
                <button
                  type="button"
                  onClick={() => setCurrPage(currPage - 1)}
                  className="w-full max-w-[450px] p-4 rounded-2xl border border-neutral-200 cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="text-white size-6" />
                  <span>Previous Step</span>
                </button>
              </li>
              <li className="w-full flex flex-col relative items-center">
                <button
                  onClick={handleCancelExit}
                  type="button"
                  className="w-full max-w-[450px] p-4 rounded-2xl border border-neutral-200 text-red-500 cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <span>Exit</span>
                </button>
              </li>
            </ul>
          </>
        );
      default:
        return null;
    }
  } else {
    switch (currPage) {
      case 1:
        return <ul></ul>;
      case 2:
        return <ul></ul>;
      default:
        return null;
    }
  }
};

const page = (props: Props) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  return (
    <div className="w-full h-full flex flex-col py-4">
      <Alert
        open={!!errorMsg}
        onClose={() => setErrorMsg(null)}
        title="Oops!"
        message={errorMsg ?? ""}
        variant="error"
        autoCloseMs={4000}
      />
      <form className="w-full p-4 py-8 flex flex-col max-w-[600px] mx-auto">
        <FormPages
          type="create exercise"
          errorMessage={errorMsg}
          setErrorMessage={setErrorMsg}
        />
      </form>
    </div>
  );
};

export default page;
