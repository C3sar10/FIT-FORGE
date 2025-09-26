"use client";
import React from "react";

import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Label } from "recharts"

type Props = {};

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 500 },
  { name: "Apr", value: 200 },
]

const page = (props: Props) => {
  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full p-4 flex items-center justify-between">
        <p className="text-sm md:text-base font-medium">Progress</p>
        <p className="text-sm md:text-base font-medium">Settings</p>
      </div>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <ResponsiveContainer width={"90%"} height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name">
              <Label value="Months" offset={-5} position="insideBottom" className="text-white"/>
            </XAxis>
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" /> {/* Indigo-500 */}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
};

export default page;
