"use client";
import React, { use } from "react";
import { useState, useEffect } from "react";
import PlanCard from "@/components/ui/PlanCard";
import { ArrowRight, CirclePlus } from "lucide-react";
import { getActivePlan, createPlan, deletePlan } from "@/utils/api";

type Props = {};

const page = (props: Props) => {
  const [activePlan, setActivePlan] = useState<boolean | null>(null);
  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    deadline: "",
    priority: "",
    tags: "",
  });

  useEffect(() => {
    async function fetchPlan() {
      const planData = await getActivePlan();
      if(planData) {
        const plan = Object.values(planData).find((p) => typeof p === "object" && p !== null && "title" in p) as any;
        setForm({
          title: plan.title, 
          type: plan.type,
          description: plan.description ?? "",
          deadline: plan.deadline ? new Date(plan.deadline).toISOString().split('T')[0] : "",
          priority: plan.priority ?? "",
          tags: plan.tags?.join(', ') ?? "",
        })
        setActivePlan(true);
      } else {
        setActivePlan(false);
      }
    }
    fetchPlan();
  }, []);

  const [showForm, setShowForm] = useState(false);

  const [formStep, setFormStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  const handleSubmit = async () => {
    try {
      const planData = {
        ...form,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        deadline: form.deadline ? new Date(form.deadline) : undefined,
      };
      const newPlan = await createPlan(planData);
      console.log("Plan created:", newPlan);
      setShowForm(false);
      setFormStep(1);
      setForm({
        title: "",
        type: "",
        description: "",
        deadline: "",
        priority: "",
        tags: "",
      });
      setActivePlan(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create plan.");
    }
  }

  const handleDelete = async () => {
    try {
      await deletePlan();
      setActivePlan(false);
      setForm({
        title: "",
        type: "",
        description: "",
        deadline: "",
        priority: "",
        tags: "",
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete plan.");
    }
  }

  const isStep1Valid = form.title && form.type && form.description;

  if (showForm) {
    return (
    <div className="w-full h-full flex flex-col items-center p-4 gap-4">
      <span className="inline-flex items-center gap-4 mt-4">
        <h1 className="text-2xl border-2 rounded-full px-2">{formStep}</h1>
        <h1 className="text-2xl font-medium">Custom Plan Builder</h1>
      </span>
      <div className="w-full max-w-2xl p-4 flex flex-col items-start gap-4 rounded-[8px]">
        {errorMsg && (
          <div className="w-full text-red-600 text-lg mt-2">*{errorMsg}*</div>
        )}
        {formStep === 1 && <>
          <label className="w-full font-medium text-left">Plan title</label>
          <input
            type="text"
            name="title"
            placeholder="Plan Title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
          <label className="w-full font-medium text-left">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md hover:cursor-pointer"
            required
          >
            <option value="">Select type</option>
            <option value="Health and Fitness Goal">Health and Fitness Goal</option>
            <option value="Cardio">Cardio</option>
            <option value="Flexibility">Flexibility</option>
            <option value="HIIT">HIIT</option>
            {/* Add more options as needed */}
          </select>
          <label className="w-full font-medium text-left">Description</label>
          <textarea
            name="description"
            placeholder="Plan Description"
            value={form.description}
            onChange={handleChange}
            className="w-full min-h-[42px] p-2 border border-gray-300 rounded-md"
            rows={4}
            required
          />
          <label className="w-full font-medium text-left">Deadline (Optional)</label>
          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <label className="w-full font-medium text-left">Priority (Optional)</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md hover:cursor-pointer"
          >
            <option value="">Select type</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <label className="w-full font-medium text-left">Tags</label>
          <input
            type="tag"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          </>
        }

        {formStep === 2 && 
          <div className="w-full flex flex-col items-start gap-4">
            <h2 className="text-2xl font-bold mb-2">Review Your Plan</h2>
            <div className="w-full px-2">
              <div className="text-xl"><strong>Title:</strong> {form.title}</div>
              <div className="text-xl"><strong>Type:</strong> {form.type}</div>
              <div className="text-xl"><strong>Description:</strong> {form.description}</div>
              <div className="text-xl"><strong>Deadline:</strong> {form.deadline ? new Date(form.deadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" }) : "None"}</div>
              <div className="text-xl"><strong>Priority:</strong> {form.priority}</div>
              <div className="flex flex-wrap gap-2 mt-2 text-xl">
                <strong>Tags:</strong>
                {form.tags
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag)
                  .map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-lime-200 text-lime-800 px-3 py-1 rounded-full text-md font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>

            <div className="w-full flex flex-col items-start gap-4">
              <button className="w-full inline-flex items-center justify-center bg-black gap-2 p-4 rounded-full hover:cursor-pointer hover:bg-zinc-900 transition-all duration-300">
                <CirclePlus size={28} className="text-white z-10" />
                <span className="text-xl text-white z-10">Add Metrics</span>
              </button>
            </div>
          </div>
        }

        <button
          onClick={() => {
            if (!isStep1Valid && formStep === 1) {
              setErrorMsg("Please fill in all required fields.");
              return;
            }
            setErrorMsg("");
            if (formStep === 2) {
              handleSubmit();
            }
            setFormStep(formStep + 1);
          }}
          className="w-full px-4 py-2 bg-lime-500 hover:bg-lime-700 rounded-full hover:cursor-pointer transition-all duration-300"
        >
          Next Step
          <ArrowRight size={20} className="inline-block ml-2" />
        </button>
        <button
          onClick={() => (
            setFormStep(1),
            setForm({
              title: "",
              type: "",
              description: "",
              deadline: "",
              priority: "",
              tags: "",
            }),
            setShowForm(false)
          )}
          className="w-full px-4 py-2 bg-red-200 text-red-700 rounded-full hover:bg-red-100 hover:cursor-pointer transition-all duration-300"
        >
          Cancel & Exit
        </button>
      </div>
    </div>);
  }

  return (
    <div className="w-full h-full flex flex-col items-center p-4 gap-4">
      {activePlan === null && (
        <h1 className="text-2xl font-medium">Loading...</h1>
      )}
      {activePlan === false && (
        <>
          <PlanCard title="Custom Plan" description="Create a plan from scratch." onClick={() => setShowForm(true)}/>
          <PlanCard 
            title="Template Plan" 
            description="Coming Soon!"
            // description="Select a pre-built workout plan"
          />
          <PlanCard 
            title="AI Guided Plan" 
            description="Coming Soon!"
            // description="Use AI to create a new plan using prompts."
          />
        </>
      )}

      { activePlan === true && (
        <div>
          <h1 className="text-2xl font-medium">You already have an active plan.</h1>
          <div className="p-4 border rounded-md shadow-sm mt-2">
            <h2 className="text-xl font-bold">{form.title}</h2>
            <p><strong>Type:</strong> {form.type}</p>
            <p><strong>Description:</strong> {form.description}</p>
            {form.deadline && <p><strong>Deadline:</strong> {form.deadline}</p>}
            <p><strong>Priority:</strong> {form.priority}</p>
            {form.tags && <p><strong>Tags:</strong> {form.tags}</p>}
          </div>
          <button
            onClick={handleDelete}
            className="mt-4 w-full px-4 py-2 bg-red-200 text-red-700 rounded-md hover:bg-red-100 hover:cursor-pointer transition-all duration-300"
          >
            Delete Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default page;
