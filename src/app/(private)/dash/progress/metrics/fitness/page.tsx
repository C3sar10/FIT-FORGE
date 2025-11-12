"use client";
import BalanceMetrics from "@/components/fitness/BalanceMetrics";
import EnduranceMetrics from "@/components/fitness/EnduranceMetrics";
import FlexibilityMetrics from "@/components/fitness/FlexibilityMetrics";
import SpeedMetrics from "@/components/fitness/SpeedMetrics";
import StrengthMetrics from "@/components/fitness/StrengthMetrics";
import {
  ArrowLeft,
  Activity,
  Dumbbell,
  Medal,
  Timer,
  Scale,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

type Props = {};

const FitnessMetricsPage = (props: Props) => {
  const [activeTab, setActiveTab] = useState<string>("strength");

  const tabs = [
    { id: "strength", label: "Strength", icon: <Dumbbell size={18} /> },
    { id: "endurance", label: "Endurance", icon: <Medal size={18} /> },
    { id: "speed", label: "Speed", icon: <Zap size={18} /> },
    { id: "balance", label: "Balance", icon: <Scale size={18} /> },
    { id: "flexibility", label: "Flexibility", icon: <Activity size={18} /> },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "strength":
        return <StrengthMetrics />;
      case "endurance":
        return <EnduranceMetrics />;
      case "speed":
        return <SpeedMetrics />;
      case "balance":
        return <BalanceMetrics />;
      case "flexibility":
        return <FlexibilityMetrics />;
      default:
        return <StrengthMetrics />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="w-full p-4 flex items-center justify-between border-b border-neutral-200 ">
        <div className="flex items-center gap-4">
          <Link href="/dash/progress">
            <ArrowLeft
              className="cursor-pointer hover:text-lime-500"
              size={24}
            />
          </Link>
          <div>
            <h1 className="text-2xl font-medium">Fitness Metrics</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Track your progress across different fitness categories
            </p>
          </div>
        </div>
        <Activity size={32} className="text-lime-600" />
      </div>

      {/* Tab Navigation */}
      <div className="w-full px-4 py-2 border-b border-neutral-200 ">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-lime-100 dark:bg-lime-900 text-lime-700 dark:text-lime-300"
                  : "hover:bg-neutral-500 "
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">{renderActiveTab()}</div>
    </div>
  );
};

export default FitnessMetricsPage;
