import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeQuiz } from "../quiz/score.ts";
import type { Question } from "../quiz/types";
import { buildResultRecord, cleanStudentName, resultDocId, summarizeResults } from "./record.ts";
import type { ResultRecord } from "./record.ts";

const questions: Question[] = [
  { question: "A", options: ["1", "2", "3", "4"], correctAnswer: 1, explanation: "a" },
  { question: "B", options: ["1", "2", "3", "4"], correctAnswer: 2, explanation: "b" },
  { question: "C", options: ["1", "2", "3", "4"], correctAnswer: 3, explanation: "c" },
];

test("이름의 앞뒤·연속 공백을 정리한다", () => {
  assert.equal(cleanStudentName("  홍  길동 "), "홍 길동");
});

test("같은 문제지·같은 이름이면 같은 결과 문서가 된다", () => {
  assert.equal(resultDocId("p1", "홍길동"), resultDocId("p1", " 홍길동 "));
  assert.equal(resultDocId("p1", "Kim"), resultDocId("p1", "kim"));
  assert.notEqual(resultDocId("p1", "홍길동"), resultDocId("p2", "홍길동"));
  assert.notEqual(resultDocId("p1", "홍길동"), resultDocId("p1", "김철수"));
});

test("결과에는 이름, 고른 답, 점수, 틀린 문항 번호가 들어간다", () => {
  const answers = [1, 3, 3];
  const record = buildResultRecord(
    { id: "p1", title: "시험" },
    " 홍길동 ",
    answers,
    gradeQuiz(questions, answers),
    new Date("2026-10-30T00:00:00Z"),
  );
  assert.equal(record.studentName, "홍길동");
  assert.deepEqual(record.answers, [1, 3, 3]);
  assert.equal(record.score, 66.7);
  assert.equal(record.correctCount, 2);
  assert.equal(record.total, 3);
  assert.deepEqual(record.wrongQuestions, [2]);
});

function record(studentName: string, score: number): ResultRecord {
  return {
    paperId: "p1",
    paperTitle: "시험",
    studentName,
    answers: [],
    score,
    correctCount: 0,
    total: 3,
    wrongQuestions: [],
    submittedAt: new Date("2026-10-30T00:00:00Z"),
  };
}

test("결과표는 이름 순이고 평균은 소수 첫째 자리까지", () => {
  const summary = summarizeResults([record("하늘", 100), record("가람", 66.7), record("나래", 33.3)]);
  assert.deepEqual(
    summary.rows.map((row) => row.studentName),
    ["가람", "나래", "하늘"],
  );
  assert.equal(summary.average, 66.7);
});

test("결과가 없으면 평균은 null", () => {
  assert.deepEqual(summarizeResults([]), { rows: [], average: null });
});
