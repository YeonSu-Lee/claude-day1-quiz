import { test } from "node:test";
import assert from "node:assert/strict";
import { contentHash, titleKey, toPublicQuestions } from "./publish.ts";
import type { Question } from "./types";

const questions: Question[] = [
  { question: "1+1은?", options: ["1", "2", "3", "4"], correctAnswer: 2, explanation: "1+1=2" },
  { question: "2+2는?", options: ["2", "3", "4", "5"], correctAnswer: 3, explanation: "2+2=4" },
];

test("학생에게 보낼 문항에는 정답과 해설이 없다", () => {
  const result = toPublicQuestions(questions);
  assert.deepEqual(result, [
    { question: "1+1은?", options: ["1", "2", "3", "4"] },
    { question: "2+2는?", options: ["2", "3", "4", "5"] },
  ]);
  for (const item of result) {
    assert.equal("correctAnswer" in item, false);
    assert.equal("explanation" in item, false);
  }
});

test("제목은 공백과 영문 대소문자 차이를 무시하고 비교한다", () => {
  assert.equal(titleKey("  중학교   정보과목 "), titleKey("중학교 정보과목"));
  assert.equal(titleKey("Quiz A"), titleKey("quiz a"));
  assert.notEqual(titleKey("중학교 정보과목"), titleKey("고등학교 정보과목"));
});

test("내용이 같으면 같은 값, 정답이나 해설이 다르면 다른 값", () => {
  const spaced = questions.map((q) => ({ ...q, question: ` ${q.question} ` }));
  assert.equal(contentHash(spaced), contentHash(questions));

  const otherAnswer = questions.map((q, i) => (i === 0 ? { ...q, correctAnswer: 1 } : q));
  assert.notEqual(contentHash(otherAnswer), contentHash(questions));

  const otherExplanation = questions.map((q, i) => (i === 1 ? { ...q, explanation: "다름" } : q));
  assert.notEqual(contentHash(otherExplanation), contentHash(questions));
});
