import MetricsBodyDataHeader from "@/components/progress/MetricsBodyDataHeader";
import { ArrowLeft, List } from "lucide-react";
import Link from "next/link";

import React from "react";

type Props = {};

const MetricsPage = (props: Props) => {
  return (
    <div className="w-full h-full flex flex-col items-start">
      <div className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dash/progress">
            <ArrowLeft
              className="cursor-pointer hover:text-lime-500"
              size={24}
            />
          </Link>
        </div>
        <Link
          href="/dash/progress/metrics/logs"
          className="flex items-center gap-2 px-3 py-2 bg-neutral-700 hover:bg-neutral-500 text-white rounded text-sm"
        >
          <List size={16} />
          View All Logs
        </Link>
      </div>
      <MetricsBodyDataHeader />
    </div>
  );
};

export default MetricsPage;
