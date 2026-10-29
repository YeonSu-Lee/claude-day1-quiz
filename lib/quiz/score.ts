import type { Answers, Question } from "./types";

export type QuestionResult = {
  question: Question;
  selected: number | null;
  isCorrect: boolean;
};

export type GradeResult = {
  correctCount: number;
  total: number;
  /** 100점 만점, 소수 첫째 자리까지 반올림한 점수 */
  score: number;
  results: QuestionResult[];
};

/** 모든 문항의 배점이 같다고 보고, 파일에 적힌 정답으로 채점합니다. */
export function gradeQuiz(questions: Question[], answers: Answers): GradeResult {
  const results = questions.map((question, index) => {
    const selected = answers[index] ?? null;
    return { question, selected, isCorrect: selected === question.correctAnswer };
  });
  const correctCount = results.filter((result) => result.isCorrect).length;
  const total = questions.length;
  const score = total === 0 ? 0 : Math.round((correctCount / total) * 1000) / 10;
  return { correctCount, total, score, results };
}
