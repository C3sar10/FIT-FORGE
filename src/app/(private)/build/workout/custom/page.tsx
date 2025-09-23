"use client";
import Alert from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";
import { useDialog } from "@/context/DialogContext";
import { http } from "@/lib/api";
import { ArrowLeft, ArrowRight, CheckCheck, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

/** Types coming back from /exercises list */
type ExerciseApiType = {
  id: string;
  author: string;
  title: string;
  type: string;
  tags: string[];
  description?: string;
  image?: string | null;
};

type Props = {};

/** ---------- Local, tiny modal ---------- */
function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120]">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 flex items-center justify-center px-4 sm:px-6"
        role="dialog"
        aria-modal="true"
      >
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

/** ---------- Form Pages (Workout) ---------- */
function WorkoutFormPages({
  errorMessage,
  setErrorMessage,
}: {
  errorMessage: string | null;
  setErrorMessage: (v: string | null) => void;
}) {
  const [currPage, setCurrPage] = useState(1);
  const { showDialog } = useDialog();
  const router = useRouter();
  const { user } = useAuth();

  // page 1: meta
  const [title, setTitle] = useState("");
  const [wType, setWType] = useState<string>("strength");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (tags.includes(t)) return;
    if (tags.length >= 12) return;
    setTags((prev) => [...prev, t]);
    setTagInput("");
  };
  const handleRemoveTag = (t: string) =>
    setTags((prev) => prev.filter((x) => x !== t));

  // page 2: select exercises (limit 12)
  const [pickerOpen, setPickerOpen] = useState(false);
  const [library, setLibrary] = useState<ExerciseApiType[]>([]);
  const [libLoaded, setLibLoaded] = useState(false);
  const [q, setQ] = useState("");

  const [selected, setSelected] = useState<ExerciseApiType[]>([]); // up to 12

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return library;
    return library.filter((e) => e.title.toLowerCase().includes(qq));
  }, [library, q]);

  const limitReached = selected.length >= 12;

  const loadLibrary = async () => {
    try {
      console.log("Entered load library.");
      const data = await http.get<{
        items: ExerciseApiType[];
        nextCursor: string | null;
      }>("/exercises?scope=all&limit=50");
      console.log("Data in load library: ", data);
      setLibrary(data.items);
      setLibLoaded(true);
    } catch (e: any) {
      setErrorMessage(e?.message || "Could not load exercises.");
    }
  };

  useEffect(() => {
    if (pickerOpen && !libLoaded) loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen]);

  const quickAdd = (ex: ExerciseApiType) => {
    if (limitReached) return;
    if (selected.find((s) => s.id === ex.id)) return;
    setSelected((prev) => [...prev, ex]);
  };
  const removeSelected = (id: string) =>
    setSelected((prev) => prev.filter((s) => s.id !== id));

  // nav
  const next = () => {
    if (currPage === 1) {
      try {
        if (!title.trim()) throw new Error("Workout title is required.");
        if (!description.trim())
          throw new Error("Workout description is required.");
        setCurrPage(2);
      } catch (e: any) {
        setErrorMessage(e?.message || "Please complete required fields.");
      }
    } else if (currPage === 2) {
      try {
        if (selected.length === 0)
          throw new Error("Add at least one exercise.");
        setCurrPage(3);
      } catch (e: any) {
        setErrorMessage(e?.message || "Please add exercises.");
      }
    }
  };
  const prev = () => setCurrPage((p) => Math.max(1, p - 1));

  const handleCancelExit = async () => {
    const res = await showDialog({
      title: "Exit Workout Builder?",
      message: "Your progress will be discarded.",
      actions: [
        { id: "stay", label: "Stay", variant: "secondary" },
        { id: "exit", label: "Exit", variant: "danger" },
      ],
    });
    if (res === "exit") router.back();
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: title.trim(),
        description: description.trim(),
        type: (wType || "strength") as
          | "strength"
          | "endurance"
          | "sport"
          | "speed"
          | "other",
        tags,
        blocks: [
          {
            title: "Main",
            items: selected.map((ex) => ({
              exerciseId: ex.id,
              // sets/reps/restSecs are optional per your schema; keep minimal for now
            })),
          },
        ],
      };

      const created = await http.post<{ id: string }>("/workouts", payload);
      if (!created?.id) throw new Error("Create response missing id.");

      await showDialog({
        title: "Workout Created",
        message: "You can now find it in your library.",
        actions: [{ id: "ok", label: "Go to Library", variant: "primary" }],
      });

      router.push("/dash/workouts"); // adjust if your library path differs
      router.refresh();
    } catch (e: any) {
      setErrorMessage(e?.message || "Failed to create workout.");
    }
  };

  // ---------- RENDER ----------
  switch (currPage) {
    case 1:
      return (
        <>
          <div className="w-full p-4 flex items-center max-w-[500px] mx-auto justify-center gap-2">
            <span className="size-8 rounded-full border border-neutral-200 flex items-center justify-center ">
              1
            </span>
            <h1 className="text-lg md:text-2xl font-medium">Create Workout</h1>
          </div>

          <ul className="w-full flex flex-col items-center gap-4">
            <li className="w-full flex flex-col relative items-start gap-1">
              <label htmlFor="wTitle" className="text-base font-medium">
                Workout Title
              </label>
              <input
                id="wTitle"
                className="w-full h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </li>

            <li className="w-full flex flex-col relative items-start gap-1">
              <label htmlFor="wType" className="text-base font-medium">
                Workout Type
              </label>
              <select
                id="wType"
                className="w-full h-12 rounded-2xl px-4 py-2 border border-neutral-200"
                value={wType}
                onChange={(e) => setWType(e.target.value)}
              >
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
                <option value="sport">Sport</option>
                <option value="speed">Speed</option>
                <option value="other">Other</option>
              </select>
            </li>

            <li className="w-full flex flex-col relative items-start gap-1">
              <label htmlFor="wDesc" className="text-base font-medium">
                Description
              </label>
              <textarea
                id="wDesc"
                rows={4}
                className="w-full rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </li>

            <li className="w-full flex flex-col relative items-start gap-1">
              <label htmlFor="wTags" className="text-base font-medium">
                Tags
              </label>
              <input
                id="wTags"
                className="w-full h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <div className="w-full flex gap-2 items-center mt-2 flex-wrap">
                <button
                  type="button"
                  className="h-8 text-xs bg-neutral-500 hover:bg-neutral-400 text-white px-4 w-fit rounded-xl"
                  onClick={handleAddTag}
                >
                  Add Tag
                </button>
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs p-2 bg-black text-white border border-neutral-200 rounded-md capitalize flex items-center justify-center"
                  >
                    <X
                      onClick={() => handleRemoveTag(t)}
                      className="size-3 mr-1 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                    />
                    {t}
                  </span>
                ))}
              </div>
            </li>

            <li className="w-full flex flex-col relative mt-6 items-center">
              <button
                type="button"
                onClick={next}
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
                className="w-full max-w-[450px] p-4 rounded-2xl border border-neutral-200 text-red-500 cursor-pointer text-center"
              >
                Exit
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
              2
            </span>
            <h1 className="text-lg md:text-2xl font-medium">
              Add Exercises (max 12)
            </h1>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="w-full max-w-[500px] mx-auto h-12 rounded-2xl bg-black hover:bg-[#1e1e1e] text-white flex items-center justify-center gap-2"
            >
              <Plus className="size-5" />
              Add Exercises
            </button>

            {/* Selected list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selected.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 border border-neutral-200 rounded-xl p-3"
                >
                  <div className="w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden">
                    {ex.image ? (
                      <img
                        src={ex.image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ex.title}</p>
                    <p className="text-xs text-neutral-500">
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

            <div className="flex flex-col gap-2 mt-6 items-center">
              <button
                type="button"
                onClick={next}
                className="w-full max-w-[450px] p-4 rounded-2xl bg-black hover:bg-[#1e1e1e] text-white cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <span>Next Step</span>
                <ArrowRight className="text-white size-6" />
              </button>

              <button
                type="button"
                onClick={prev}
                className="w-full max-w-[450px] p-4 rounded-2xl border border-neutral-200 cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <ArrowLeft className="text-white size-6" />
                <span>Previous Step</span>
              </button>

              <button
                onClick={handleCancelExit}
                type="button"
                className="w-full max-w-[450px] p-4 rounded-2xl border border-neutral-200 text-red-500 cursor-pointer text-center"
              >
                Exit
              </button>
            </div>
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
                  className="flex-1 h-10 rounded-xl border border-neutral-700 bg-neutral-800 px-3"
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
                  const disabled = already || limitReached;
                  return (
                    <div
                      key={ex.id}
                      className="flex items-center gap-3 border border-neutral-800 rounded-xl p-3 bg-neutral-900"
                    >
                      <div className="w-14 h-14 bg-neutral-200 rounded-lg overflow-hidden">
                        {ex.image ? (
                          <img
                            src={ex.image}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
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
        </>
      );

    case 3:
      return (
        <>
          <div className="w-full p-4 flex items-center max-w-[500px] mx-auto justify-center gap-2">
            <span className="size-8 rounded-full border border-neutral-200 flex items-center justify-center ">
              3
            </span>
            <h1 className="text-lg md:text-2xl font-medium">Review Workout</h1>
          </div>

          <ul className="w-full flex flex-col items-start gap-4 max-w-[700px] mx-auto">
            <li>
              <p className="font-medium text-base">Title</p>
              <p className="text-2xl">{title}</p>
            </li>
            <li>
              <p className="font-medium text-base">Type</p>
              <p className="text-2xl capitalize">{wType}</p>
            </li>
            <li>
              <p className="font-medium text-base">Description</p>
              <p className="text-base whitespace-pre-wrap">{description}</p>
            </li>
            <li>
              <p className="font-medium text-base">Tags</p>
              <div className="flex gap-2 flex-wrap mt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-sm p-2 bg-black text-white border border-neutral-200 rounded-md capitalize"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </li>
            <li>
              <p className="font-medium text-base">
                Exercises ({selected.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {selected.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center gap-3 border border-neutral-200 rounded-xl p-3"
                  >
                    <div className="w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden">
                      {ex.image ? (
                        <img
                          src={ex.image}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{ex.title}</p>
                      <p className="text-xs text-neutral-500">
                        {ex.tags?.slice(0, 3).join(" · ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </li>

            <li className="w-full flex flex-col gap-3 items-center mt-6">
              <button
                onClick={handleSubmit}
                type="button"
                className="w-full max-w-[450px] p-4 rounded-2xl bg-lime-500 hover:bg-lime-700 text-white cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <span>Create Workout</span>
                <CheckCheck className="text-white size-6" />
              </button>

              <button
                type="button"
                onClick={() => setCurrPage(2)}
                className="w-full max-w-[450px] p-4 rounded-2xl border border-neutral-200 cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <ArrowLeft className="text-white size-6" />
                <span>Previous Step</span>
              </button>

              <button
                onClick={handleCancelExit}
                type="button"
                className="w-full max-w-[450px] p-4 rounded-2xl border border-neutral-200 text-red-500 cursor-pointer text-center"
              >
                Exit
              </button>
            </li>
          </ul>
        </>
      );

    default:
      return null;
  }
}

/** ---------- Page wrapper ---------- */
const Page = (props: Props) => {
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
      <form className="w-full p-4 py-8 flex flex-col max-w-[900px] mx-auto">
        <WorkoutFormPages
          errorMessage={errorMsg}
          setErrorMessage={setErrorMsg}
        />
      </form>
    </div>
  );
};

export default Page;
