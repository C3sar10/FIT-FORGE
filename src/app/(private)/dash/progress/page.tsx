import ProgressPageHeaderSection from "@/components/progress/ProgressPageHeaderSection";
import GraphicCard from "@/components/ui/GraphicCard";
import Link from "next/link";

type Props = {};

const page = (props: Props) => {
  return (
    <div className="w-full h-full flex flex-col items-center px-4 gap-4">
      <ProgressPageHeaderSection />
      <div className="w-full flex flex-col gap-4 mt-4">
        <h1 className="text-3xl font-medium">More Analytics</h1>
        <Link href="/dash/progress/metrics">
          <GraphicCard
            title="My Metrics"
            description="Numerical data you track - body weight, body fat, etc."
          />
        </Link>
        <Link href="/dash/progress/metrics/fitness">
          <GraphicCard
            title="Fitness Metrics"
            description="Track strength, endurance, speed, balance & flexibility progress."
          />
        </Link>
        <GraphicCard
          title="Body Data"
          description="Track your daily nutrition - calories, macros, etc."
        />
        <GraphicCard
          title="My Mood"
          description="Track your personal records and progress on key lifts."
        />
      </div>
    </div>
  );
};

export default page;
