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
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

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
  const [reps, setReps] = useState<string>(
    (exercise.details?.reps ?? "") as string
  );
  const [restSecs, setRestSecs] = useState<number | undefined>(
    exercise.details?.restSecs ?? undefined
  );
  const [equipmentInput, setEquipmentInput] = useState(
    toStringList(exercise.details?.equipment as any)
  );
  //new features of exercises
  const [repType, setRepType] = useState<string>(
    (exercise.details?.repType ?? "") as string
  );
  const [repNumber, setRepNumber] = useState<number | undefined>(
    exercise.details?.repNumber ?? undefined
  );
  const [repRange, setRepRange] = useState<{
    min: number | null;
    max: number | null;
  }>({
    min: exercise.details.repRange?.min ?? null,
    max: exercise.details.repRange?.max ?? null,
  });
  const [timeRange, setTimeRange] = useState<{
    min: any | null;
    max: any | null;
  }>({
    min: exercise.details.timeRange?.min ?? null,
    max: exercise.details.timeRange?.max ?? null,
  });

  // If exercise changes (nav), sync local edit state
  useEffect(() => {
    setTitle(exercise.title);
    setType(exercise.type || "strength");
    setDescription(exercise.description ?? "");
    setTagsInput(toStringList(exercise.tags));
    setSets(exercise.details?.sets ?? undefined);
    setReps((exercise.details?.reps ?? "") as string);
    setRestSecs(exercise.details?.restSecs ?? undefined);
    setEquipmentInput(toStringList(exercise.details?.equipment as any));
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
    setReps((exercise.details?.reps ?? "") as string);
    setRestSecs(exercise.details?.restSecs ?? undefined);
    setEquipmentInput(toStringList(exercise.details?.equipment as any));
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

  const handleSave = async () => {
    const ok = await confirmSave();
    if (!ok) return;

    // Build patch payload (only fields your schema knows)
    const payload: any = {
      title: title.trim(),
      type: type as any,
      description: description.trim(),
      tags: fromStringList(tagsInput).slice(0, 12),
      details: {
        sets: Number.isFinite(sets as any) ? Number(sets) : undefined,
        // allow number or "6-10"
        reps:
          typeof reps === "string" && /^\d+$/.test(reps.trim())
            ? Number(reps.trim())
            : reps?.toString()?.trim() || undefined,
        restSecs: Number.isFinite(restSecs as any)
          ? Number(restSecs)
          : undefined,
        equipment: fromStringList(equipmentInput),
      },
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
                {repType === "number" && (
                  <>
                    <p className="font-medium">Reps</p>{" "}
                    <p className="font-semibold text-4xl">{repNumber}</p>
                  </>
                )}
                {repType === "repRange" && (
                  <>
                    <p className="font-medium">Rep Range</p>{" "}
                    <p className="font-semibold text-4xl">
                      {repRange.min}
                      {" - "}
                      {repRange.max}
                    </p>
                  </>
                )}
                {repType === "distance" && (
                  <>
                    <p className="font-medium">Distance</p>
                    <p className="font-semibold text-4xl">
                      {exercise.details?.repDistance?.distance ?? "-"}{" "}
                      {exercise.details?.repDistance?.unit ?? ""}
                    </p>
                  </>
                )}
                {repType === "timeRange" && (
                  <>
                    <p className="font-medium">Time Range</p>{" "}
                    <p className="font-semibold text-4xl">
                      {timeRange.min}
                      {" - "}
                      {timeRange.max}
                    </p>
                  </>
                )}
                {repType === "duration" && (
                  <>
                    <p className="font-medium">Duration</p>{" "}
                    <p className="font-semibold text-4xl">
                      {exercise.details?.repDuration?.time ?? "-"}{" "}
                      {exercise.details?.repDuration?.unit ?? ""}
                    </p>
                  </>
                )}
              </li>
              <li className="w-full flex flex-col gap-1 p-4 bg-lime-950 border border-neutral-200 rounded-2xl text-white">
                <p className="font-medium">
                  Target Metric: {exercise.details.targetMetric?.name ?? ""}
                </p>

                <p className="font-semibold text-4xl">
                  {exercise.details.targetMetric?.number ?? "-"}{" "}
                  {exercise.details.targetMetric?.unit ?? "-"}
                </p>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <li className="flex flex-col gap-1">
                <label className="text-sm">Sets</label>
                <input
                  type="number"
                  className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white "
                  value={typeof sets === "number" ? sets : ""}
                  onChange={(e) =>
                    setSets(e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </li>
              <li className="flex flex-col gap-1">
                <label className="text-sm">Reps / Range (e.g. 8 or 6-10)</label>
                <input
                  className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white"
                  value={reps ?? ""}
                  onChange={(e) => setReps(e.target.value)}
                />
              </li>
              <li className="flex flex-col gap-1">
                <label className="text-sm">Rest (secs)</label>
                <input
                  type="number"
                  className="h-12 rounded-2xl border border-neutral-300 px-4 bg-black text-white"
                  value={typeof restSecs === "number" ? restSecs : ""}
                  onChange={(e) =>
                    setRestSecs(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </li>
            </div>

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
          title={currExercise.title}
          tags={currExercise.tags}
          imageUrl={currExercise.image ?? null}
          id={currExercise.id}
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
