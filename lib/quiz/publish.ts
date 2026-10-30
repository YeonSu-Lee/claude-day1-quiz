import { createHash } from "node:crypto";
import type { PublicQuestion, Question } from "./types";

/** 풀이 중 학생에게 보낼 문항만 남깁니다(정답·해설 제거). */
export function toPublicQuestions(questions: Question[]): PublicQuestion[] {
  return questions.map(({ question, options }) => ({ question, options: [...options] }));
}

/** 제목 중복 비교용 값. 앞뒤 공백, 연속 공백, 영문 대소문자 차이는 같은 제목으로 봅니다. */
export function titleKey(title: string) {
  return title.trim().replace(/\s+/g, " ").toLowerCase();
}

/** 문항 내용(문제·보기·정답·해설) 중복 비교용 값. 글자 앞뒤 공백 차이는 무시합니다. */
export function contentHash(questions: Question[]) {
  const normalized = questions.map((q) => [
    q.question.trim(),
    q.options.map((option) => option.trim()),
    q.correctAnswer,
    q.explanation.trim(),
  ]);
  return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}
