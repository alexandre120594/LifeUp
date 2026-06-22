export type TrtStudyDay = {
  id: string;
  category: string;
  title: string;
  schedule: string;
  topics: string[];
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
  description: string;
  structure: string;
  stats: {
    weeks: number;
    days: number;
    totalHours: number;
    hoursPerDay: number;
  };
  weeks: TrtStudyWeek[];
  subjectGroups: Array<{
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  }>;
  references: string[];
};
