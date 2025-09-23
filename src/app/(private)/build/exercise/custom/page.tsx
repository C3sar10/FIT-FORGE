"use client";
import Alert from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";
import { useDialog } from "@/context/DialogContext";
import { http } from "@/lib/api";
import { ExerciseApiType } from "@/types/workout";
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
    // page 2 variables
    const [numSets, setNumSets] = useState(0);
    const [reps, setReps] = useState("");
    const [restSecs, setRestSecs] = useState(0);
    const [equipList, setEquipList] = useState<string[]>([]);
    const [newEquip, setNewEquip] = useState("");

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
          if (reps === "") throw new Error("Missing Exercise reps/rep range.");
          if (restSecs < 0)
            throw new Error("Rest Seconds cannot be less than 0");
          else {
            setCurrPage(currPage + 1);
          }
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
          },
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
                <label htmlFor="reps" className="text-base font-medium">
                  Reps or Rep range
                </label>
                <input
                  required
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  type="text"
                  name="reps"
                  id="reps"
                  className="w-full h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                />
              </li>
              <li className="w-full flex flex-col relative items-start gap-1">
                <label htmlFor="restSecs" className="text-base font-medium">
                  Rest Seconds
                </label>
                <input
                  required
                  value={restSecs}
                  onChange={(e) => setRestSecs(Number(e.target.value))}
                  type="number"
                  name="restSecs"
                  id="restSecs"
                  className="w-full h-12 rounded-2xl border border-neutral-200 px-4 py-2 text-base"
                />
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
                <p className="font-medium text-base">Reps/Rep Range</p>
                <p className="text-2xl">{reps}</p>
              </li>
              <li className="w-full flex flex-col relative items-start gap-1">
                <p className="font-medium text-base">Rest Seconds</p>
                <p className="text-2xl">{restSecs}</p>
              </li>
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
