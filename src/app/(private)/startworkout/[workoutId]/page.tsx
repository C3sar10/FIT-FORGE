"use client";
import PageContainer from "@/components/ui/PageContainer";
import ExerciseLi from "@/components/workouts/ExerciseLi";
import SkeletonExerciseLi from "@/components/workouts/SkeletonExerciseLi";
import { useAuth } from "@/context/AuthContext";
import { useDialog } from "@/context/DialogContext";
import { useTimer } from "@/context/TimerContext";
import { useWorkoutGlobal } from "@/context/WorkoutContext";
import { api, http } from "@/lib/api";
import { ExerciseType, WorkoutType } from "@/types/workout";
import { useFavoriteWorkouts } from "@/hooks/useFavoriteWorkouts";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Heart,
  Pencil,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Add this

/* ---------------- Small modal ---------------- */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-3xl rounded-2xl bg-neutral-900 text-white p-4 sm:p-6 border border-neutral-800 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-neutral-800"
            >
              <X className="size-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Header (preview) ---------------- */
interface HeaderProps {
  title: string;
  tags: string[];
  imageUrl?: string;
  id: string | null;
  description: string;
  author: string;
  favorite: boolean;
  toggleFavorite: () => void;
}
const StartWorkoutHeader: React.FC<HeaderProps> = ({
  title = "Workout",
  tags = [],
  imageUrl,
  id,
  description = "",
  author = "FitForge",
  favorite = false,
  toggleFavorite,
}) => {
  const router = useRouter();

  return (
    <div className="w-full h-auto aspect-square md:aspect-video bg-neutral-200 flex flex-col justify-end relative">
      {imageUrl && (
        <img
          src={imageUrl}
          className="absolute w-full h-full object-cover -z-0 "
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
            <div className="w-full max-w-[500px] flex flex-wrap gap-1">
              {tags.slice(0, 5).map((tag, i) => (
                <span
                  key={i}
                  className="capitalize text-xs sm:text-sm font-medium text-white px-2 py-1 bg-[#1e1e1e] rounded-md border border-neutral-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col w-full max-w-[500px]">
            <h2 className="text-base font-medium">Description</h2>
            <p className="text-sm md:text-base line-clamp-3">{description}</p>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-4">
          {favorite ? (
            <Heart onClick={toggleFavorite} fill="red" size={40} />
          ) : (
            <Heart onClick={toggleFavorite} size={40} />
          )}

          <Download size={24} />
        </div>
      </div>
    </div>
  );
};

/* ---------------- Body (view + edit) ---------------- */
function toStringList(a?: string[]) {
  return (a ?? []).join(", ");
}
function fromStringList(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 12);
}

type ExerciseCard = {
  id: string;
  title: string;
  tags: string[];
  image?: string | null;
};

const StartWorkoutBody = ({
  exerciseList,
  workout,
  canEdit,
  onUpdated,
  onDeleted,
}: {
  exerciseList: ExerciseType[];
  workout: WorkoutType;
  canEdit: boolean;
  onUpdated: (next: WorkoutType) => void;
  onDeleted: () => void;
}) => {
  const {
    toggleWorkoutPlayer,
    currWorkoutId,
    setCurrWorkoutId,
    setPlayerState,
  } = useWorkoutGlobal();
  const { state, start } = useTimer();
  const router = useRouter();

  const [dropDown, setDropDown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ---- Edit fields (black bg, white text) ----
  const [name, setName] = useState(workout.name || "");
  const [wType, setWType] = useState(workout.type || "strength");
  const [description, setDescription] = useState(workout.description || "");
  const [tagsInput, setTagsInput] = useState(toStringList(workout.tags));

  const initialSelected: ExerciseCard[] = useMemo(() => {
    const seen = new Set<string>();
    const out: ExerciseCard[] = [];
    // Use workout.blocks directly for immediate computation (synchronous)
    const flatItems = (workout.blocks ?? []).flatMap((b: any) => b.items ?? []);
    flatItems.forEach((i: { exerciseId: string }) => {
      const id = i.exerciseId;
      if (!seen.has(id)) {
        seen.add(id);
        // Fallback to exerciseList for title/image if available
        const matchingExercise = exerciseList.find((e) => e.id === id);
        out.push({
          id,
          title: matchingExercise?.title ?? "Unknown Exercise",
          tags: matchingExercise?.tags ?? [],
          image: matchingExercise?.image ?? null,
        });
      }
    });
    return out;
  }, [workout.blocks, exerciseList]);

  const [selected, setSelected] = useState<ExerciseCard[]>(initialSelected);

  // Picker modal
  const [pickerOpen, setPickerOpen] = useState(false);
  const [library, setLibrary] = useState<ExerciseCard[]>([]);
  const [libLoaded, setLibLoaded] = useState(false);
  const [q, setQ] = useState("");
  const limitReached = selected.length >= 12;

  useEffect(() => {
    // sync when workout changes
    setName(workout.name || "");
    setWType(workout.type || "strength");
    setDescription(workout.description || "");
    setTagsInput(toStringList(workout.tags));
    setSelected(initialSelected);
    setIsEditing(false);
    setDropDown(false);
  }, [workout.id, initialSelected]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return library;
    return library.filter((e) => e.title.toLowerCase().includes(qq));
  }, [library, q]);

  const loadLibrary = async () => {
    if (libLoaded) return;
    const items: ExerciseCard[] = [];
    let cursor: string | null = null;
    do {
      const qs = new URLSearchParams({ scope: "all", limit: "50" });
      if (cursor) qs.set("cursor", cursor);
      const page = await http.get<{ items: any[]; nextCursor: string | null }>(
        `/exercises?${qs.toString()}`
      );
      items.push(
        ...page.items.map((i) => ({
          id: i.id,
          title: i.title,
          tags: i.tags ?? [],
          image: i.image ?? null,
        }))
      );
      cursor = page.nextCursor;
    } while (items.length < 100 && cursor);

    console.log("Items in load library: ", items);

    setLibrary(items);
    setLibLoaded(true);
  };

  useEffect(() => {
    if (pickerOpen) loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen]);

  const quickAdd = (ex: ExerciseCard) => {
    if (limitReached) return;
    if (selected.find((s) => s.id === ex.id)) return;
    setSelected((prev) => [...prev, ex]);
  };
  const removeSelected = (id: string) =>
    setSelected((prev) => prev.filter((s) => s.id !== id));

  const handleStart = () => {
    if (currWorkoutId === null) {
      setPlayerState("play");
      setCurrWorkoutId(workout.id);
      if (state.status === "idle" && workout.id) start(workout.id);
      router.back();
      toggleWorkoutPlayer();
    }
  };
  const startEdit = () => {
    if (!canEdit) return;
    setIsEditing(true);
  };
  const cancelEdit = () => {
    setIsEditing(false);
    // reset to original
    setName(workout.name || "");
    setWType(workout.type || "strength");
    setDescription(workout.description || "");
    setTagsInput(toStringList(workout.tags));
    setSelected(initialSelected);
  };

  const { showDialog } = useDialog();

  const handleSave = async () => {
    const res = await showDialog({
      title: "Save changes?",
      message: "This will update your workout.",
      actions: [
        { id: "cancel", label: "Cancel", variant: "secondary" },
        { id: "save", label: "Save", variant: "primary" },
      ],
    });
    if (res !== "save") return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      type: wType as "strength" | "endurance" | "sport" | "speed" | "other",
      tags: fromStringList(tagsInput),
      blocks: [
        {
          title: "Main",
          items: selected.map((ex) => ({ exerciseId: ex.id })),
        },
      ],
    };

    const updated = await http.patch<WorkoutType & { id: string }>(
      `/workouts/${workout.id}`,
      JSON.parse(JSON.stringify(payload))
    );
    onUpdated(updated);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const res = await showDialog({
      title: "Delete workout?",
      message: "This action cannot be undone.",
      actions: [
        { id: "cancel", label: "Cancel", variant: "secondary" },
        { id: "delete", label: "Delete", variant: "danger" },
      ],
    });
    if (res !== "delete") return;

    await http.del(`/workouts/${workout.id}`);
    onDeleted();
  };

  return (
    <div className="w-full h-full p-4 py-8 flex flex-col gap-4 bg-linear-180 from-lime-950 to-lime-400">
      {/* -------- VIEW MODE -------- */}
      {!isEditing && (
        <>
          <div className="w-full flex flex-col gap-2">
            <h2 className="text-sm md:text-base font-medium">Exercise List</h2>
            <ul className="w-full flex flex-col gap-2">
              {exerciseList.length > 0 &&
                exerciseList.map((exercise) => (
                  <ExerciseLi exerciseObj={exercise} key={exercise.id} />
                ))}
              {exerciseList.length <= 0 &&
                Array(5)
                  .fill(0)
                  .map((_, index) => <SkeletonExerciseLi key={index} />)}
            </ul>
          </div>

          <div className="w-full mt-4 flex flex-col items-center gap-4">
            <div className="w-full h-[64px] flex items-center gap-1">
              <button
                onClick={handleStart}
                className="w-full h-full rounded-l-2xl bg-black text-white hover:bg-[#1e1e1e] cursor-pointer shadow-2xl"
              >
                Start Workout
              </button>
              <button
                onClick={() => setDropDown((d) => !d)}
                className="w-14 h-full bg-black text-white flex items-center justify-center rounded-r-2xl hover:bg-[#1e1e1e] cursor-pointer shadow-2xl"
              >
                {dropDown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {dropDown && (
              <>
                <button
                  disabled={!canEdit}
                  onClick={startEdit}
                  className={`w-full h-[60px] rounded-2xl text-white cursor-pointer shadow-2xl ${
                    canEdit ? "bg-black hover:bg-[#1e1e1e]" : "bg-neutral-600"
                  }`}
                >
                  <span className="inline-flex items-center gap-2 justify-center">
                    <Pencil className="size-4" />
                    Edit Workout
                  </span>
                </button>
                <button
                  disabled={!canEdit}
                  onClick={handleDelete}
                  className={`w-full h-[60px] rounded-2xl text-white cursor-pointer shadow-2xl ${
                    canEdit ? "bg-red-700 hover:bg-red-600" : "bg-neutral-600"
                  }`}
                >
                  <span className="inline-flex items-center gap-2 justify-center">
                    <Trash2 className="size-4" />
                    Delete Workout
                  </span>
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* -------- EDIT MODE -------- */}
      {isEditing && (
        <div className="w-full flex flex-col gap-4">
          <h2 className="text-sm md:text-base font-medium">Edit Workout</h2>

          <ul className="w-full flex flex-col gap-3">
            <li className="flex flex-col gap-1">
              <label className="text-sm">Title</label>
              <input
                className="h-12 rounded-2xl border border-neutral-700 px-4 bg-black text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </li>

            <li className="flex flex-col gap-1">
              <label className="text-sm">Type</label>
              <select
                className="h-12 rounded-2xl border border-neutral-700 px-4 bg-black text-white"
                onChange={(e) => setWType(e.target.value)}
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
                className="rounded-2xl border border-neutral-700 px-4 py-2 bg-black text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </li>

            <li className="flex flex-col gap-1">
              <label className="text-sm">Tags (comma-separated)</label>
              <input
                className="h-12 rounded-2xl border border-neutral-700 px-4 bg-black text-white"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </li>

            {/* Selected exercises + picker trigger */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="w-full max-w-[500px] h-12 rounded-2xl bg-black text-white hover:bg-[#1e1e1e] flex items-center justify-center gap-2"
              >
                <Plus className="size-5" />
                Add Exercises
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selected.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center gap-3 border border-neutral-200 rounded-xl p-3 bg-neutral-950"
                  >
                    <div className="w-16 h-16 bg-neutral-800 rounded-lg overflow-hidden">
                      {ex.image ? (
                        <img
                          src={ex.image}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {ex.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {ex.tags?.slice(0, 3).join(" · ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="h-8 px-3 rounded-lg bg-neutral-700 text-white text-xs hover:bg-neutral-600"
                      onClick={() => removeSelected(ex.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </ul>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-2">
            <button
              onClick={cancelEdit}
              className="h-12 px-4 rounded-2xl border border-neutral-700 bg-black text-white"
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

          {/* Picker modal */}
          <Modal
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            title="Choose Exercises"
          >
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 h-10 rounded-xl border border-neutral-700 bg-neutral-800 px-3 text-white"
                  placeholder="Search by title…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <span className="text-xs text-neutral-400 self-center">
                  {selected.length}/12 selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {filtered.map((ex) => {
                  const already = !!selected.find((s) => s.id === ex.id);
                  const disabled = already || selected.length >= 12;
                  return (
                    <div
                      key={ex.id}
                      className="flex items-center gap-3 border border-neutral-800 rounded-xl p-3 bg-neutral-900"
                    >
                      <div className="w-14 h-14 bg-neutral-700 rounded-lg overflow-hidden">
                        {ex.image ? (
                          <img
                            src={ex.image}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {ex.title}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate">
                          {ex.tags?.slice(0, 3).join(" · ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => quickAdd(ex)}
                        className={`h-8 px-3 rounded-lg text-xs ${
                          disabled
                            ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                            : "bg-lime-600 hover:bg-lime-500 text-white"
                        }`}
                      >
                        {already ? "Added" : "Add"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="h-10 px-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};

/* ---------------- Page wrapper ---------------- */
const page = () => {
  const { workoutId } = useParams() as { workoutId: string };
  const [currWorkout, setCurrWorkout] = useState<WorkoutType | null>(null);
  const [exerciseList, setExerciseList] = useState<ExerciseType[]>([]);
  const [mount, setMount] = useState(false);

  const { user } = useAuth();
  const { showDialog } = useDialog();
  const router = useRouter();
  const queryClient = useQueryClient(); // Add this to fix error 1

  // Use the favorites hook
  const { isFavorite, toggleFavorite } = useFavoriteWorkouts();

  // Fetch workout
  const {
    data: workoutData,
    isLoading: workoutLoading,
    error: workoutError,
  } = useQuery<WorkoutType, Error>({
    queryKey: ["workout", workoutId],
    queryFn: async () => {
      const res = await api(`/workouts/${workoutId}`);
      return await res.json();
    },
    enabled: !!workoutId,
  });

  // Fetch exercises in parallel, cache each
  useEffect(() => {
    if (workoutData) {
      setCurrWorkout(workoutData);

      const fetchExercises = async () => {
        const flatIds = (workoutData.blocks ?? []).flatMap((b: any) =>
          (b.items ?? []).map((i: any) => i.exerciseId)
        );
        const uniqueIds = [...new Set(flatIds)]; // Avoid duplicate fetches
        const exercises = await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const data = await queryClient.fetchQuery<ExerciseType>({
                queryKey: ["exercise", id],
                queryFn: async () => {
                  const res = await api(`/exercises/${id}`);
                  if (!res.ok)
                    throw new Error(`Failed to fetch exercise ${id}`);
                  return await res.json();
                },
              });
              return data;
            } catch (err) {
              console.error(`Error fetching exercise ${id}:`, err);
              return null; // Handle missing exercises gracefully
            }
          })
        );

        const validExercises = exercises.filter(
          (e): e is ExerciseType => e !== null
        );
        setExerciseList(validExercises);
      };
      fetchExercises().catch((err) => {
        console.error("Exercise fetch error:", err);
        showDialog({
          title: "Error",
          message: "Failed to load exercises. Please try again.",
          actions: [{ id: "ok", label: "OK", variant: "primary" }],
        });
      });
    }
  }, [workoutData, queryClient, showDialog]);

  useEffect(() => {
    setMount(true);
  }, []);

  if (!mount || workoutLoading)
    return (
      <PageContainer>
        <main className="p-6">Loading…</main>
      </PageContainer>
    );

  if (!currWorkout) {
    return (
      <PageContainer>
        <main className="p-6">Workout not found</main>
      </PageContainer>
    );
  }

  // Owner can edit/delete; global cannot
  const myId = (user as any)?.userId || (user as any)?.id || (user as any)?._id;
  const canEdit =
    currWorkout.author !== "global" &&
    myId &&
    String(currWorkout.author) === String(myId);

  const handleUpdated = (next: WorkoutType) => {
    setCurrWorkout(next);
    // refresh the list view
    const flat: ExerciseType[] = (next.blocks ?? []).flatMap((b: any) =>
      (b.items ?? []).map((i: any) => i)
    );
    setExerciseList(flat);
    // Update cache
    queryClient.setQueryData(["workout", workoutId], next);
  };

  const handleDeleted = async () => {
    await showDialog({
      title: "Workout deleted",
      message: "Returning to your library.",
      actions: [{ id: "ok", label: "OK", variant: "primary" }],
    });
    router.push("/dash/workouts"); // adjust to your route
    router.refresh();
  };

  return (
    <PageContainer>
      <main className="w-full h-full min-h-dvh relative">
        <StartWorkoutHeader
          title={currWorkout.name}
          tags={currWorkout.tags}
          imageUrl={currWorkout.image}
          id={currWorkout.id}
          description={currWorkout.description}
          author={
            currWorkout.author === "global" ? "FitForge" : user?.name ?? "You"
          }
          favorite={currWorkout.id ? isFavorite(currWorkout.id) : false}
          toggleFavorite={() => {
            if (currWorkout.id) {
              toggleFavorite(currWorkout.id, isFavorite(currWorkout.id));
            }
          }}
        />
        <StartWorkoutBody
          exerciseList={exerciseList}
          workout={currWorkout}
          canEdit={!!canEdit}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      </main>
    </PageContainer>
  );
};

export default page;
