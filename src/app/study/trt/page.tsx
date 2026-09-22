import plans from "@/data/study-plans.json";
import { StudyPlanDashboard, type StudyPlan } from "@/components/study/StudyPlanDashboard";

export default function TrtStudyPlanPage() {
  return <StudyPlanDashboard plan={plans.find((plan) => plan.id === "trt") as StudyPlan} />;
}
