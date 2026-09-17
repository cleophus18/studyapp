export type Difficulty = "Easy" | "Medium" | "Hard";

export type User = {
  id?: number;
  name: string;
  email: string;
  role?: string;
  university?: string;
  degree?: string;
};

export type Question = {
  id: string;
  topic: string;
  difficulty: Difficulty;
  kind: string;
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  textAnswer?: string;
  explanation: string;
};
