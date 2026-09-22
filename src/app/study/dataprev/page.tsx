import plans from "@/data/study-plans.json";
import { StudyPlanDashboard, type StudyPlan } from "@/components/study/StudyPlanDashboard";

export default function DataprevStudyPlanPage() {
  return <StudyPlanDashboard plan={plans.find((plan) => plan.id === "dataprev") as StudyPlan} />;
}
