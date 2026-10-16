export type CurrentUser = {
  id: number;
  email: string;
  name: string | null;
};

export type UpdateCurrentUserInput = {
  name: string;
};
