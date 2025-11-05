"use client";
import React from "react";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

import { ArrowRight } from "lucide-react";

const chartData = [
  {
    name: "Progress",
    num: 6.67,
    fill: "#65A30D", // green
  },
  {
    name: "None",
    num: 10,
    fill: "transparent",
  },
];

interface GraphicCardProps {
  title: string;
  description: string;
}

const GraphicCard: React.FC<GraphicCardProps> = ({ title, description }) => {
  return (
    <div
      style={{
        background:
          "linear-gradient(to top, #000000 0%, #263D05 80%, #263D05 100%)",
      }}
      className="relative w-full h-auto rounded-lg overflow-hidden py-4 flex flex-row items-center justify-between"
    >
      <div className="w-full text-white text-left pl-8 md:pr-4">
        <h1 className="text-4xl font-medium">{title}</h1>
        <p className="text-base md:text-lg mt-2">{description}</p>
        <span className="inline-flex items-center gap-2 mt-8 cursor-pointer hover:underline text-2xl">
          <p>View More</p>
          <ArrowRight size={32} />
        </span>
      </div>

      <div className="flex flex-col w-full items-center">
        <div className="relative w-full h-60 flex items-center justify-center">
          <ResponsiveContainer width={"100%"} height={240}>
            <RadialBarChart
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={140}
              startAngle={90}
              endAngle={450}
            >
              <RadialBar
                background={{ fill: "transparent" }}
                dataKey="num"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-medium text-white">
              {chartData[0].num}
            </span>
          </div>
        </div>

        <h2 className="text-2xl">Avg. Rating</h2>
      </div>
    </div>
  );
};

export default GraphicCard;
