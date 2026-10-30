import { createHash } from "node:crypto";
import type { GradeResult } from "../quiz/score";
import { cleanStudentName } from "./name.ts";

export { cleanStudentName, MAX_STUDENT_NAME_LENGTH } from "./name.ts";

/** 같은 문제지·같은 이름이면 같은 문서 id가 되어, 다시 풀면 최신 결과로 덮어씁니다. */
export function resultDocId(paperId: string, studentName: string) {
  const nameKey = createHash("sha256").update(cleanStudentName(studentName).toLowerCase()).digest("hex").slice(0, 32);
  return `${paperId}_${nameKey}`;
}

/** Firestore results 문서 하나. 같은 문제지·같은 이름에는 최신 완료 결과 하나만 남습니다. */
export type ResultRecord = {
  paperId: string;
  paperTitle: string;
  studentName: string;
  /** 문항별로 고른 보기 번호(1~4) */
  answers: number[];
  score: number;
  correctCount: number;
  total: number;
  /** 틀린 문항 번호(1부터) */
  wrongQuestions: number[];
  submittedAt: Date;
};

export function buildResultRecord(
  paper: { id: string; title: string },
  studentName: string,
  answers: number[],
  grade: GradeResult,
  submittedAt: Date,
): ResultRecord {
  return {
    paperId: paper.id,
    paperTitle: paper.title,
    studentName: cleanStudentName(studentName),
    answers,
    score: grade.score,
    correctCount: grade.correctCount,
    total: grade.total,
    wrongQuestions: grade.results.flatMap((result, index) => (result.isCorrect ? [] : [index + 1])),
    submittedAt,
  };
}

export type ResultRow = {
  studentName: string;
  score: number;
  wrongQuestions: number[];
  submittedAt: string;
};

export type ResultSummary = {
  rows: ResultRow[];
  /** 학생 이름별 최신 결과의 평균. 소수 첫째 자리까지 반올림. 결과가 없으면 null */
  average: number | null;
};

/** 교사 결과표. 이름 순으로 정렬하고, 이름당 하나뿐인 최신 결과로 평균을 냅니다. */
export function summarizeResults(records: ResultRecord[]): ResultSummary {
  const rows = records
    .map((record) => ({
      studentName: record.studentName,
      score: record.score,
      wrongQuestions: record.wrongQuestions,
      submittedAt: record.submittedAt.toISOString(),
    }))
    .sort((a, b) => a.studentName.localeCompare(b.studentName, "ko"));
  const average =
    rows.length === 0 ? null : Math.round((rows.reduce((sum, row) => sum + row.score, 0) / rows.length) * 10) / 10;
  return { rows, average };
}
