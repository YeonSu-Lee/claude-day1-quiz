import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeQuiz } from "./score.ts";
import type { Question } from "./types.ts";

function makeQuestions(correctAnswers: number[]): Question[] {
  return correctAnswers.map((correctAnswer, index) => ({
    question: `문제 ${index + 1}`,
    options: ["가", "나", "다", "라"],
    correctAnswer,
    explanation: `해설 ${index + 1}`,
  }));
}

test("모두 맞히면 100점", () => {
  const result = gradeQuiz(makeQuestions([1, 2, 3, 4]), [1, 2, 3, 4]);
  assert.equal(result.score, 100);
  assert.equal(result.correctCount, 4);
  assert.equal(result.total, 4);
});

test("모두 틀리면 0점", () => {
  const result = gradeQuiz(makeQuestions([1, 2]), [2, 1]);
  assert.equal(result.score, 0);
});

test("점수는 소수 첫째 자리까지 반올림한다", () => {
  assert.equal(gradeQuiz(makeQuestions([1, 1, 1]), [1, 2, 2]).score, 33.3);
  assert.equal(gradeQuiz(makeQuestions([1, 1, 1]), [1, 1, 2]).score, 66.7);
  assert.equal(gradeQuiz(makeQuestions([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), [1, 1, 1, 1, 1, 1, 1, 1, 2, 2]).score, 80);
});

test("문항별 정오와 고른 답을 돌려준다", () => {
  const result = gradeQuiz(makeQuestions([4, 2]), [4, 3]);
  assert.deepEqual(
    result.results.map((r) => [r.selected, r.isCorrect]),
    [
      [4, true],
      [3, false],
    ],
  );
});

test("답하지 않은 문항은 틀린 것으로 본다", () => {
  const result = gradeQuiz(makeQuestions([1, 2]), [1, null]);
  assert.equal(result.correctCount, 1);
  assert.equal(result.results[1].selected, null);
  assert.equal(result.results[1].isCorrect, false);
});
