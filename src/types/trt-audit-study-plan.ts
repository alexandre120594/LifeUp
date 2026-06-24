export type TrtAuditStudyDay = {
  day: number;
  week: number;
  dow: string;
  matter: string;
  title: string;
  sourceTitle: string;
  topics: string[];
  cls?: string;
  originalDay?: number;
};

export type TrtAuditStudyTrack = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  salary: string;
  data: TrtAuditStudyDay[];
  weeks: number;
  days: number;
  hours: number;
};

export type TrtAuditStudyPlan = {
  title: string;
  subtitle: string;
  description: string;
  sourceFile: string;
  stats: {
    baseWeeks: number;
    analystDays: number;
    technicianDays: number;
    topicsPerDay: number;
    hoursPerDay: number;
    uniqueDays: number;
  };
  usage: {
    paragraphs: string[];
    items: string[];
  };
  verification: {
    paragraphs: string[];
    items: string[];
  };
  additions: {
    paragraphs: string[];
    items: string[];
  };
  note: string;
  tracks: TrtAuditStudyTrack[];
};
