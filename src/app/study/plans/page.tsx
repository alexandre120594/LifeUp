import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import plans from "@/data/study-plans.json";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { Button } from "@/components/ui/button";
import { StudyPlansWorkspace, type StudyPlan } from "@/components/study/StudyPlanDashboard";

export default function StudyPlansPage() {
  return <DashboardViewport contentClassName="overflow-hidden pb-4" header={<MenuPageHeader eyebrow="Estudos" title="Planos" action={<Button asChild size="sm" variant="ghost"><Link href="/study"><ArrowLeft className="size-4" />Voltar aos estudos</Link></Button>} />}>
    <StudyPlansWorkspace plans={plans as StudyPlan[]} />
  </DashboardViewport>;
}
