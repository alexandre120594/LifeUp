export type TrtStudyDay = {
  id: string;
  sourceId: string;
  category: string;
  title: string;
  schedule: string;
  topics: string[];
  task: string;
};

export type TrtStudyWeek = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  tag: string;
  days: TrtStudyDay[];
};

export type TrtStudyPlan = {
  title: string;
  subtitle: string;
  description: string;
  sourceFile: string;
  structure: string;
  usage: string[];
  stats: {
    weeks: number;
    days: number;
    totalHours: number;
    hoursPerDay: number;
    examDate: string;
    contentEndDate: string;
    questions: number;
    compensation: string;
  };
  headerStats: Array<{
    label: string;
    value: string;
  }>;
  weeks: TrtStudyWeek[];
  checklistSections: Array<{
    title: string;
    description: string;
    groups: Array<{
      title: string;
      items: Array<{
        id: string;
        title: string;
      }>;
    }>;
  }>;
  audit: {
    summary: string;
    distribution: Array<{
      label: string;
      value: string;
    }>;
    notes: string[];
  };
  editalCards: Array<{
    label: string;
    title: string;
    description: string;
  }>;
};
