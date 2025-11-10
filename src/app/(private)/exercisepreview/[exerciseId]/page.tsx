"use client";
import PageContainer from "@/components/ui/PageContainer";
import { useAuth } from "@/context/AuthContext";
import { useDialog } from "@/context/DialogContext";
import { http } from "@/lib/api";
import { ExerciseType } from "@/types/workout";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Heart,
  X,
  Check,
  Pencil,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

/* ---------------- Target Metric Input Component ---------------- */
interface TargetMetricInputProps {
  targetMetric: {
    type: string;
    name: string;
    number: number | undefined;
    unit: string;
  };
  onChange: (targetMetric: {
    type: string;
    name: string;
    number: number | undefined;
    unit: string;
  }) => void;
}

const TargetMetricInput: React.FC<TargetMetricInputProps> = ({
  targetMetric,
  onChange,
}) => {
  const getUnitsForType = (type: string): string[] => {
    switch (type) {
      case "weight":
        return ["lbs", "kg"];
      case "time":
        return ["seconds", "minutes", "hours"];
      case "distance":
        return ["meters", "kilometers", "feet", "miles", "yards"];
      case "count":
        return ["reps", "sets", "cycles"];
      case "speed":
        return ["mph", "km/h", "m/s"];
      case "percentage":
        return ["%"];
      default:
        return ["units"];
    }
  };

  const getDefaultUnit = (type: string): string => {
    const units = getUnitsForType(type);
    return units[0];
  };

  const handleTypeChange = (newType: string) => {
    const defaultUnit = getDefaultUnit(newType);
    onChange({
      ...targetMetric,
      type: newType,
      unit: defaultUnit,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">Target Metric</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric Type */}
        <li className="flex flex-col gap-1">
          <label className="text-sm">Metric Type</label>
          <select
            className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white"
            value={targetMetric.type}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="weight">Weight</option>
            <option value="time">Time</option>
            <option value="distance">Distance</option>
            <option value="count">Count</option>
            <option value="speed">Speed</option>
            <option value="percentage">Percentage</option>
            <option value="other">Other</option>
          </select>
        </li>

        {/* Metric Name */}
        <li className="flex flex-col gap-1">
          <label className="text-sm">Metric Name</label>
          <input
            className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white"
            value={targetMetric.name}
            onChange={(e) =>
              onChange({ ...targetMetric, name: e.target.value })
            }
            placeholder="e.g. Target Weight, Max Speed"
          />
        </li>

        {/* Target Value */}
        <NumberInput
          label="Target Value"
          value={targetMetric.number}
          onChange={(value) => onChange({ ...targetMetric, number: value })}
          min={0}
          placeholder="Target amount"
        />

        {/* Units */}
        <li className="flex flex-col gap-1">
          <label className="text-sm">Unit</label>
          <select
            className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white"
            value={targetMetric.unit}
            onChange={(e) =>
              onChange({ ...targetMetric, unit: e.target.value })
            }
            disabled={!targetMetric.type}
          >
            {getUnitsForType(targetMetric.type).map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </li>
      </div>
    </div>
  );
};

/* ---------------- Number Input with Increment/Decrement ---------------- */
interface NumberInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  placeholder?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max,
  placeholder,
}) => {
  const handleIncrement = () => {
    const newValue = (value ?? 0) + 1;
    if (!max || newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, (value ?? 1) - 1);
    onChange(newValue === 0 ? undefined : newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value ? Number(e.target.value) : undefined;
    if (
      newValue === undefined ||
      (newValue >= min && (!max || newValue <= max))
    ) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm">{label}</label>
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={(value ?? 0) <= min}
          className="h-12 w-12 rounded-l-2xl border border-r-0 border-neutral-300 bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          className="h-12 border border-neutral-300 px-4 bg-black text-white text-center flex-1 min-w-0"
          value={value ?? ""}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={max !== undefined && (value ?? 0) >= max}
          className="h-12 w-12 rounded-r-2xl border border-l-0 border-neutral-300 bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

/* ---------------- Header (unchanged visual) ---------------- */
interface HeaderProps {
  title: string;
  tags: string[];
  imageUrl?: string | null;
  id: string;
  description: string;
  author: string;
}
const StartExerciseHeader: React.FC<HeaderProps> = ({
  title,
  tags,
  imageUrl,
  id,
  description,
  author,
}) => {
  const router = useRouter();
  return (
    <div className="w-full h-auto aspect-square md:aspect-video bg-neutral-200 flex flex-col justify-end relative">
      {imageUrl && (
        <img
          src={imageUrl}
          className="absolute w-full h-full object-cover -z-0"
          alt="image"
        />
      )}
      <ArrowLeft
        onClick={() => router.back()}
        className="absolute z-20 top-4 left-4 size-7 cursor-pointer hover:text-black"
      />
      <div className="absolute w-full h-full z-0 bg-linear-180 from-black/0 to-black/90" />
      <div className="w-full p-4 flex flex-col z-20 gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-medium line-clamp-2">
            {title}
          </h1>
          <div className="flex flex-col gap-2">
            <p className="text-base md:text-2xl font-medium">
              Created by {author}
            </p>
            <div className="w-full max-w-[350px] md:max-w-[500px] flex flex-wrap gap-1">
              {tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="capitalize text-xs sm:text-sm font-medium text-white px-2 py-1 bg-[#1e1e1e] rounded-md border border-neutral-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col w-full max-w-[350px] md:max-w-[500px]">
            <h2 className="text-base font-medium">Description</h2>
            <p className="text-sm md:text-base line-clamp-3">{description}</p>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-4">
          <span>
            <Heart size={24} />
          </span>
          <span>
            <Download size={24} />
          </span>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Body w/ Edit & Delete ---------------- */

function toStringList(a?: string[]) {
  return (a ?? []).join(", ");
}

function fromStringList(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 20);
}

interface BodyProps {
  exercise: ExerciseType;
  canEdit: boolean;
  onUpdated: (next: ExerciseType) => void;
  onDeleted: () => void;
}
const StartExerciseBody: React.FC<BodyProps> = ({
  exercise,
  canEdit,
  onUpdated,
  onDeleted,
}) => {
  const { showDialog } = useDialog();
  const [dropDown, setDropDown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable copy
  const [title, setTitle] = useState(exercise.title);
  const [type, setType] = useState<string>(exercise.type || "strength");
  const [description, setDescription] = useState(exercise.description ?? "");
  const [tagsInput, setTagsInput] = useState(toStringList(exercise.tags));
  const [sets, setSets] = useState<number | undefined>(
    exercise.details?.sets ?? undefined
  );
  const [equipmentInput, setEquipmentInput] = useState(
    toStringList(exercise.details?.equipment as any)
  );

  // New exercise details state
  const [repType, setRepType] = useState<string>(
    exercise.details?.repType ?? "number"
  );
  const [repNumber, setRepNumber] = useState<number | undefined>(
    exercise.details?.repNumber ?? undefined
  );
  const [repRange, setRepRange] = useState<{
    min: number | undefined;
    max: number | undefined;
  }>({
    min: exercise.details?.repRange?.min ?? undefined,
    max: exercise.details?.repRange?.max ?? undefined,
  });
  const [repDuration, setRepDuration] = useState<{
    time: number | undefined;
    unit: string;
  }>({
    time: exercise.details?.repDuration?.time ?? undefined,
    unit: exercise.details?.repDuration?.unit ?? "seconds",
  });
  const [repDistance, setRepDistance] = useState<{
    distance: number | undefined;
    unit: string;
  }>({
    distance: exercise.details?.repDistance?.distance ?? undefined,
    unit: exercise.details?.repDistance?.unit ?? "meters",
  });
  const [restTimeSets, setRestTimeSets] = useState<{
    time: number | undefined;
    unit: string;
  }>({
    time: exercise.details?.restTimeSets?.time ?? undefined,
    unit: exercise.details?.restTimeSets?.unit ?? "seconds",
  });
  const [restTimeReps, setRestTimeReps] = useState<{
    time: number | undefined;
    unit: string;
  }>({
    time: exercise.details?.restTimeReps?.time ?? undefined,
    unit: exercise.details?.restTimeReps?.unit ?? "seconds",
  });

  // Target Metric State
  const [targetMetric, setTargetMetric] = useState<{
    type: string;
    name: string;
    number: number | undefined;
    unit: string;
  }>({
    type: exercise.details?.targetMetric?.type ?? "",
    name: exercise.details?.targetMetric?.name ?? "",
    number: exercise.details?.targetMetric?.number ?? undefined,
    unit: exercise.details?.targetMetric?.unit ?? "units",
  });

  // If exercise changes (nav), sync local edit state
  useEffect(() => {
    setTitle(exercise.title);
    setType(exercise.type || "strength");
    setDescription(exercise.description ?? "");
    setTagsInput(toStringList(exercise.tags));
    setSets(exercise.details?.sets ?? undefined);
    setEquipmentInput(toStringList(exercise.details?.equipment as any));

    // Update new fields
    setRepType(exercise.details?.repType ?? "number");
    setRepNumber(exercise.details?.repNumber ?? undefined);
    setRepRange({
      min: exercise.details?.repRange?.min ?? undefined,
      max: exercise.details?.repRange?.max ?? undefined,
    });
    setRepDuration({
      time: exercise.details?.repDuration?.time ?? undefined,
      unit: exercise.details?.repDuration?.unit ?? "seconds",
    });
    setRepDistance({
      distance: exercise.details?.repDistance?.distance ?? undefined,
      unit: exercise.details?.repDistance?.unit ?? "meters",
    });
    setRestTimeSets({
      time: exercise.details?.restTimeSets?.time ?? undefined,
      unit: exercise.details?.restTimeSets?.unit ?? "seconds",
    });
    setRestTimeReps({
      time: exercise.details?.restTimeReps?.time ?? undefined,
      unit: exercise.details?.restTimeReps?.unit ?? "seconds",
    });
    setTargetMetric({
      type: exercise.details?.targetMetric?.type ?? "",
      name: exercise.details?.targetMetric?.name ?? "",
      number: exercise.details?.targetMetric?.number ?? undefined,
      unit: exercise.details?.targetMetric?.unit ?? "units",
    });

    setIsEditing(false);
    setDropDown(false);
  }, [exercise.id]);

  const toggleDropDown = () => setDropDown((d) => !d);

  const startEdit = () => {
    if (!canEdit) return;
    setIsEditing(true);
  };

  const cancelEdit = () => {
    // revert local edits
    setTitle(exercise.title);
    setType(exercise.type || "strength");
    setDescription(exercise.description ?? "");
    setTagsInput(toStringList(exercise.tags));
    setSets(exercise.details?.sets ?? undefined);
    setEquipmentInput(toStringList(exercise.details?.equipment as any));

    // Revert new fields
    setRepType(exercise.details?.repType ?? "number");
    setRepNumber(exercise.details?.repNumber ?? undefined);
    setRepRange({
      min: exercise.details?.repRange?.min ?? undefined,
      max: exercise.details?.repRange?.max ?? undefined,
    });
    setRepDuration({
      time: exercise.details?.repDuration?.time ?? undefined,
      unit: exercise.details?.repDuration?.unit ?? "seconds",
    });
    setRepDistance({
      distance: exercise.details?.repDistance?.distance ?? undefined,
      unit: exercise.details?.repDistance?.unit ?? "meters",
    });
    setRestTimeSets({
      time: exercise.details?.restTimeSets?.time ?? undefined,
      unit: exercise.details?.restTimeSets?.unit ?? "seconds",
    });
    setRestTimeReps({
      time: exercise.details?.restTimeReps?.time ?? undefined,
      unit: exercise.details?.restTimeReps?.unit ?? "seconds",
    });
    setTargetMetric({
      type: exercise.details?.targetMetric?.type ?? "",
      name: exercise.details?.targetMetric?.name ?? "",
      number: exercise.details?.targetMetric?.number ?? undefined,
      unit: exercise.details?.targetMetric?.unit ?? "units",
    });

    setIsEditing(false);
  };

  const confirmSave = async () => {
    const res = await showDialog({
      title: "Save changes?",
      message: "This will update your custom exercise.",
      actions: [
        { id: "cancel", label: "Cancel", variant: "secondary" },
        { id: "save", label: "Save", variant: "primary" },
      ],
    });
    return res === "save";
  };

  const validateRepRange = (): boolean => {
    if (repType === "repRange") {
      const { min, max } = repRange;
      if (min === undefined || max === undefined) return false;
      if (min < 0 || max < 0) return false;
      if (min >= max) return false;
    }
    return true;
  };

  const handleSave = async () => {
    // Validate rep ranges
    if (!validateRepRange()) {
      showDialog({
        title: "Invalid Rep Range",
        message:
          "Please ensure rep range has valid min and max values where min < max, and both are >= 0.",
        actions: [{ id: "ok", label: "OK", variant: "primary" }],
      });
      return;
    }

    const ok = await confirmSave();
    if (!ok) return;

    // Build details object based on repType
    const details: any = {
      sets: Number.isFinite(sets as any) ? Number(sets) : undefined,
      repType,
      equipment: fromStringList(equipmentInput),
    };

    // Add rep-specific fields based on repType
    switch (repType) {
      case "number":
        if (repNumber !== undefined) details.repNumber = repNumber;
        break;
      case "repRange":
        if (repRange.min !== undefined && repRange.max !== undefined) {
          details.repRange = { min: repRange.min, max: repRange.max };
        }
        break;
      case "duration":
        if (repDuration.time !== undefined) {
          details.repDuration = {
            time: repDuration.time,
            unit: repDuration.unit,
          };
        }
        break;
      case "distance":
        if (repDistance.distance !== undefined) {
          details.repDistance = {
            distance: repDistance.distance,
            unit: repDistance.unit,
          };
        }
        break;
    }

    // Add rest time fields if provided
    if (restTimeSets.time !== undefined) {
      details.restTimeSets = {
        time: restTimeSets.time,
        unit: restTimeSets.unit,
      };
    }
    if (restTimeReps.time !== undefined) {
      details.restTimeReps = {
        time: restTimeReps.time,
        unit: restTimeReps.unit,
      };
    }

    // Add target metric if provided
    if (
      targetMetric.type &&
      targetMetric.name &&
      targetMetric.number !== undefined
    ) {
      details.targetMetric = {
        type: targetMetric.type,
        name: targetMetric.name,
        number: targetMetric.number,
        unit: targetMetric.unit,
      };
    }

    const payload: any = {
      title: title === undefined ? "" : title.trim(),
      type: type as any,
      description: description.trim(),
      tags: fromStringList(tagsInput).slice(0, 12),
      details,
    };

    // Clean undefineds
    const cleaned = JSON.parse(JSON.stringify(payload));

    const updated = await http.patch<ExerciseType>(
      `/exercises/${exercise.id}`,
      cleaned
    );

    onUpdated(updated);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const res = await showDialog({
      title: "Delete exercise?",
      message:
        "This cannot be undone. The exercise will be removed from your library.",
      actions: [
        { id: "cancel", label: "Cancel", variant: "secondary" },
        { id: "delete", label: "Delete", variant: "danger" },
      ],
    });
    if (res !== "delete") return;

    await http.del(`/exercises/${exercise.id}`);
    onDeleted();
  };

  const equipmentList = useMemo(
    () => (exercise.details?.equipment ?? []) as string[],
    [exercise.details?.equipment]
  );

  return (
    <div className="w-full h-full p-4 py-8 flex flex-col gap-4 bg-linear-180 from-lime-950 to-lime-400">
      {false && (
        <div className="w-full max-w-[600px] mx-auto h-auto aspect-video bg-neutral-500 rounded-2xl" />
      )}
      {/* ----- VIEW MODE ----- */}
      {!isEditing && (
        <>
          <div className="w-full flex flex-col gap-2">
            <h2 className="text-sm md:text-base font-medium">
              Exercise Details
            </h2>
            <ul className="w-full grid grid-cols-1 min-[375px]:grid-cols-2 lg:grid-cols-3 gap-4">
              <li className="w-full flex flex-col gap-1 p-4 bg-lime-950 border border-neutral-200 rounded-2xl text-white">
                <p className="font-medium">Sets</p>
                <p className="font-semibold text-4xl">
                  {exercise.details?.sets ?? "-"}
                </p>
              </li>
              <li className="w-full flex flex-col gap-1 p-4 bg-lime-950 border border-neutral-200 rounded-2xl text-white">
                {exercise.details?.repType === "number" && (
                  <>
                    <p className="font-medium">Reps</p>{" "}
                    <p className="font-semibold text-4xl">
                      {exercise.details?.repNumber ?? "-"}
                    </p>
                  </>
                )}
                {exercise.details?.repType === "repRange" && (
                  <>
                    <p className="font-medium">Rep Range</p>{" "}
                    <p className="font-semibold text-4xl">
                      {exercise.details?.repRange?.min ?? "-"}
                      {" - "}
                      {exercise.details?.repRange?.max ?? "-"}
                    </p>
                  </>
                )}
                {exercise.details?.repType === "distance" && (
                  <>
                    <p className="font-medium">Distance</p>
                    <p className="font-semibold text-4xl">
                      {exercise.details?.repDistance?.distance ?? "-"}{" "}
                      {exercise.details?.repDistance?.unit ?? ""}
                    </p>
                  </>
                )}
                {exercise.details?.repType === "timeRange" && (
                  <>
                    <p className="font-medium">Time Range</p>{" "}
                    <p className="font-semibold text-4xl">
                      {exercise.details?.timeRange?.min?.time ?? "-"}{" "}
                      {exercise.details?.timeRange?.min?.unit ?? ""} -{" "}
                      {exercise.details?.timeRange?.max?.time ?? "-"}{" "}
                      {exercise.details?.timeRange?.max?.unit ?? ""}
                    </p>
                  </>
                )}
                {exercise.details?.repType === "duration" && (
                  <>
                    <p className="font-medium">Duration</p>{" "}
                    <p className="font-semibold text-4xl">
                      {exercise.details?.repDuration?.time ?? "-"}{" "}
                      {exercise.details?.repDuration?.unit ?? ""}
                    </p>
                  </>
                )}
                {!exercise.details?.repType && (
                  <>
                    <p className="font-medium">Reps</p>{" "}
                    <p className="font-semibold text-4xl">
                      {exercise.details?.reps ?? "-"}
                    </p>
                  </>
                )}
              </li>
              <li className="w-full flex flex-col gap-1 p-4 bg-lime-950 border border-neutral-200 rounded-2xl text-white">
                <p className="font-medium">
                  {exercise.details?.targetMetric?.name || "Target Metric"}
                </p>
                <div className="flex items-end gap-1">
                  <p className="font-semibold text-4xl">
                    {exercise.details?.targetMetric?.number ?? "-"}
                  </p>
                  <span className="text-2xl">
                    {exercise.details?.targetMetric?.unit ?? ""}
                  </span>
                </div>
                {exercise.details?.targetMetric?.type && (
                  <p className="text-xs text-lime-200 capitalize">
                    {exercise.details.targetMetric.type} target
                  </p>
                )}
              </li>

              <li className="w-full flex flex-col gap-1 p-4 bg-lime-950 border border-neutral-200 rounded-2xl text-white">
                <p className="font-medium">Rest time between Sets</p>
                <div className="flex items-end gap-1">
                  <p className="text-4xl">
                    {exercise.details?.restTimeSets?.time ?? "0"}{" "}
                  </p>
                  <span className="text-2xl">
                    {exercise.details?.restTimeSets?.unit?.slice(0, 3) ?? ""}
                  </span>
                </div>
              </li>
              <li className="w-full flex flex-col gap-1 p-4 bg-lime-950 border border-neutral-200 rounded-2xl text-white">
                <p className="font-medium">Rest time between Reps</p>
                <div className="flex items-end gap-1">
                  <p className="text-4xl">
                    {exercise.details?.restTimeReps?.time ?? "0"}
                  </p>
                  <span className="text-2xl">
                    {exercise.details?.restTimeReps?.unit?.slice(0, 3) ?? ""}
                  </span>
                </div>
              </li>
              <li className="w-full grow flex flex-col gap-1 col-span-full">
                <p className="font-medium">Equipment You Will Need</p>
                <ul className="list-disc flex flex-col pl-4">
                  {equipmentList.length > 0 ? (
                    equipmentList.map((item, i) => <li key={i}>{item}</li>)
                  ) : (
                    <li>No Equipment needed.</li>
                  )}
                </ul>
              </li>
            </ul>
          </div>

          <div
            className="w-full mt-4 flex flex-col items-center gap-4 
           "
          >
            <div className="w-full h-[64px] flex items-center gap-1">
              <button
                disabled={!canEdit}
                onClick={startEdit}
                className={`w-full h-full rounded-l-2xl text-white cursor-pointer shadow-2xl ${
                  canEdit
                    ? "bg-black hover:bg-[#1e1e1e]"
                    : "bg-neutral-600 cursor-not-allowed"
                }`}
              >
                <span className="inline-flex items-center gap-2 justify-center">
                  <Pencil className="size-4" />
                  Edit Exercise
                </span>
              </button>
              <button
                onClick={toggleDropDown}
                className="w-14 h-full bg-black text-white flex items-center justify-center rounded-r-2xl hover:bg-[#1e1e1e] cursor-pointer shadow-2xl"
              >
                {dropDown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            {dropDown && (
              <button
                disabled={!canEdit}
                onClick={handleDelete}
                className={`w-full h-[60px] rounded-2xl text-white cursor-pointer shadow-2xl ${
                  canEdit
                    ? "bg-red-700 hover:bg-red-600"
                    : "bg-neutral-600 cursor-not-allowed"
                }`}
                title={
                  canEdit
                    ? "Delete this exercise"
                    : "Only the owner can delete. Global exercises cannot be deleted."
                }
              >
                <span className="inline-flex items-center gap-2 justify-center">
                  <Trash2 className="size-4" />
                  Delete Exercise
                </span>
              </button>
            )}
          </div>
        </>
      )}

      {/* ----- EDIT MODE ----- */}
      {isEditing && (
        <div className="w-full flex flex-col gap-4">
          <h2 className="text-sm md:text-base font-medium">Edit Exercise</h2>

          <ul className="w-full flex flex-col gap-3">
            <li className="flex flex-col gap-1">
              <label className="text-sm">Title</label>
              <input
                className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </li>

            <li className="flex flex-col gap-1">
              <label className="text-sm">Type</label>
              <select
                className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
                <option value="sport">Sport</option>
                <option value="speed">Speed</option>
                <option value="other">Other</option>
              </select>
            </li>

            <li className="flex flex-col gap-1">
              <label className="text-sm">Description</label>
              <textarea
                rows={4}
                className="rounded-2xl border border-neutral-300 px-4 py-2 bg-black text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </li>

            <li className="flex flex-col gap-1">
              <label className="text-sm">Tags (comma-separated)</label>
              <input
                className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </li>

            {/* Sets Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberInput
                label="Sets"
                value={sets}
                onChange={setSets}
                min={0}
                placeholder="Number of sets"
              />

              {/* Rep Type Selection */}
              <li className="flex flex-col gap-1">
                <label className="text-sm">Rep Type</label>
                <select
                  className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white"
                  value={repType}
                  onChange={(e) => setRepType(e.target.value)}
                >
                  <option value="number">Fixed Number</option>
                  <option value="repRange">Rep Range</option>
                  <option value="duration">Duration</option>
                  <option value="distance">Distance</option>
                  <option value="time">Time</option>
                  <option value="timeRange">Time Range</option>
                  <option value="other">Other</option>
                </select>
              </li>
            </div>

            {/* Conditional Rep Inputs Based on Type */}
            {repType === "number" && (
              <NumberInput
                label="Number of Reps"
                value={repNumber}
                onChange={setRepNumber}
                min={0}
                placeholder="Reps per set"
              />
            )}

            {repType === "repRange" && (
              <div className="grid grid-cols-2 gap-3">
                <NumberInput
                  label="Min Reps"
                  value={repRange.min}
                  onChange={(value) =>
                    setRepRange((prev) => ({ ...prev, min: value }))
                  }
                  min={0}
                  placeholder="Minimum reps"
                />
                <NumberInput
                  label="Max Reps"
                  value={repRange.max}
                  onChange={(value) =>
                    setRepRange((prev) => ({ ...prev, max: value }))
                  }
                  min={repRange.min || 0}
                  placeholder="Maximum reps"
                />
                {repRange.min !== undefined &&
                  repRange.max !== undefined &&
                  repRange.min >= repRange.max && (
                    <p className="col-span-2 text-red-400 text-sm">
                      Min reps must be less than max reps
                    </p>
                  )}
              </div>
            )}

            {repType === "duration" && (
              <div className="grid grid-cols-2 gap-3">
                <NumberInput
                  label="Duration"
                  value={repDuration.time}
                  onChange={(value) =>
                    setRepDuration((prev) => ({ ...prev, time: value }))
                  }
                  min={0}
                  placeholder="Duration amount"
                />
                <li className="flex flex-col gap-1">
                  <label className="text-sm">Duration Unit</label>
                  <select
                    className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white"
                    value={repDuration.unit}
                    onChange={(e) =>
                      setRepDuration((prev) => ({
                        ...prev,
                        unit: e.target.value,
                      }))
                    }
                  >
                    <option value="seconds">Seconds</option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                  </select>
                </li>
              </div>
            )}

            {repType === "distance" && (
              <div className="grid grid-cols-2 gap-3">
                <NumberInput
                  label="Distance"
                  value={repDistance.distance}
                  onChange={(value) =>
                    setRepDistance((prev) => ({ ...prev, distance: value }))
                  }
                  min={0}
                  placeholder="Distance amount"
                />
                <li className="flex flex-col gap-1">
                  <label className="text-sm">Distance Unit</label>
                  <select
                    className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white"
                    value={repDistance.unit}
                    onChange={(e) =>
                      setRepDistance((prev) => ({
                        ...prev,
                        unit: e.target.value,
                      }))
                    }
                  >
                    <option value="meters">Meters</option>
                    <option value="kilometers">Kilometers</option>
                    <option value="feet">Feet</option>
                    <option value="miles">Miles</option>
                    <option value="yards">Yards</option>
                  </select>
                </li>
              </div>
            )}

            {/* Rest Time Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium">Rest Between Sets</h3>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Time"
                    value={restTimeSets.time}
                    onChange={(value) =>
                      setRestTimeSets((prev) => ({ ...prev, time: value }))
                    }
                    min={0}
                    placeholder="Rest time"
                  />
                  <li className="flex flex-col gap-1">
                    <label className="text-sm">Unit</label>
                    <select
                      className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white"
                      value={restTimeSets.unit}
                      onChange={(e) =>
                        setRestTimeSets((prev) => ({
                          ...prev,
                          unit: e.target.value,
                        }))
                      }
                    >
                      <option value="seconds">Seconds</option>
                      <option value="minutes">Minutes</option>
                    </select>
                  </li>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium">Rest Between Reps</h3>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Time"
                    value={restTimeReps.time}
                    onChange={(value) =>
                      setRestTimeReps((prev) => ({ ...prev, time: value }))
                    }
                    min={0}
                    placeholder="Rest time"
                  />
                  <li className="flex flex-col gap-1">
                    <label className="text-sm">Unit</label>
                    <select
                      className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white"
                      value={restTimeReps.unit}
                      onChange={(e) =>
                        setRestTimeReps((prev) => ({
                          ...prev,
                          unit: e.target.value,
                        }))
                      }
                    >
                      <option value="seconds">Seconds</option>
                      <option value="minutes">Minutes</option>
                    </select>
                  </li>
                </div>
              </div>
            </div>

            {/* Target Metric Input */}
            <TargetMetricInput
              targetMetric={targetMetric}
              onChange={setTargetMetric}
            />

            <li className="flex flex-col gap-1">
              <label className="text-sm">
                Equipment (comma-separated, e.g. dumbbells, bench)
              </label>
              <input
                className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white"
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
              />
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-2">
            <button
              onClick={cancelEdit}
              className="h-12 px-4 rounded-2xl border border-neutral-300 bg-black text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="h-12 px-4 rounded-2xl bg-lime-600 text-white hover:bg-lime-500 inline-flex items-center gap-2"
            >
              <Check className="size-4" />
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- Page wrapper ---------------- */
const Page = () => {
  const params = useParams();
  const paramId = (params?.exerciseId ?? params?.id) as
    | string
    | string[]
    | undefined;
  const exerciseId =
    typeof paramId === "string"
      ? paramId
      : Array.isArray(paramId)
      ? paramId[0]
      : undefined;

  const { user } = useAuth();
  const { showDialog } = useDialog();
  const router = useRouter();

  const [currExercise, setCurrExercise] = useState<ExerciseType | null>(null);
  const [mount, setMount] = useState(false);

  // Try direct /exercises/:id, else list fallback
  const fetchCurrExercise = async (id: string) => {
    try {
      const data = await http.get<ExerciseType>(`/exercises/${id}`);
      setCurrExercise(data);
    } catch {
      const resp = await http.get<{
        items: ExerciseType[];
        nextCursor: string | null;
      }>(`/exercises?scope=all&limit=50`);
      setCurrExercise(resp.items.find((x) => x.id === id) || null);
    }
  };

  useEffect(() => {
    setMount(true);
    if (exerciseId) fetchCurrExercise(exerciseId);
  }, [exerciseId]);

  if (!mount || !currExercise)
    return (
      <PageContainer>
        <main className="p-6">Loading…</main>
      </PageContainer>
    );

  // Only the owner can edit/delete; global is never deletable
  const myId = (user as any)?.userId || (user as any)?.id || (user as any)?._id;
  const canEdit =
    currExercise.author !== "global" &&
    myId &&
    String(currExercise.author) === String(myId);

  const handleUpdated = (next: ExerciseType) => {
    setCurrExercise(next);
  };

  const handleDeleted = async () => {
    await showDialog({
      title: "Exercise deleted",
      message: "Returning to your library.",
      actions: [{ id: "ok", label: "OK", variant: "primary" }],
    });
    router.push("/dash/workouts/library/exercises"); // adjust if your library route differs
    router.refresh();
  };

  return (
    <PageContainer>
      <main className="w-full h-full min-h-dvh relative">
        <StartExerciseHeader
          title={currExercise.title ?? ""}
          tags={currExercise.tags ?? []}
          imageUrl={currExercise.image ?? null}
          id={currExercise.id ?? ""}
          description={currExercise.description ?? ""}
          author={
            currExercise.author === "global" ? "FitForge" : user?.name ?? "You"
          }
        />
        <StartExerciseBody
          exercise={currExercise}
          canEdit={!!canEdit}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      </main>
    </PageContainer>
  );
};

export default Page;
