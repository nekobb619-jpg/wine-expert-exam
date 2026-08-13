export type QuestionLevel = '幹' | '枝' | '葉';

export interface Question {
  id: number;
  level: QuestionLevel;
  category: string;
  question: string;
  correctOption: string;
  wrongOptions: string[];
  explanation: string;
}
