import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseQuizFile } from "./parse.ts";

const valid = {
  question: "1 + 1은?",
  options: ["1", "2", "3", "4"],
  correctAnswer: 2,
  explanation: "1에 1을 더하면 2입니다.",
};

function parse(data: unknown) {
  return parseQuizFile(JSON.stringify(data));
}

test("예시 문제 파일을 그대로 읽는다", () => {
  const text = readFileSync(new URL("../../sample-questions.json", import.meta.url), "utf8");
  const result = parseQuizFile(text);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.questions.length, 10);
    assert.equal(result.questions[0].correctAnswer, 4);
  }
});

test("맨 앞에 BOM이 있어도 읽는다", () => {
  const result = parseQuizFile("﻿" + JSON.stringify({ questions: [valid] }));
  assert.equal(result.ok, true);
});

test("JSON이 아니면 거부한다", () => {
  const result = parseQuizFile("이건 JSON이 아닙니다");
  assert.equal(result.ok, false);
});

test("questions 배열이 없거나 비어 있으면 거부한다", () => {
  assert.equal(parse({}).ok, false);
  assert.equal(parse({ questions: "문제" }).ok, false);
  assert.equal(parse([valid]).ok, false);
  assert.equal(parse({ questions: [] }).ok, false);
});

test("잘못된 문항이 하나라도 있으면 파일 전체를 거부하고 문항 번호를 알려준다", () => {
  const result = parse({ questions: [valid, { ...valid, options: ["a", "b", "c"] }] });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.deepEqual(result.errors, ["2번 문항의 보기(options)가 4개가 아닙니다."]);
  }
});

test("항목별 규칙을 검사한다", () => {
  const cases: unknown[] = [
    { ...valid, question: "  " },
    { ...valid, question: 3 },
    { ...valid, options: ["a", "b", "c", 4] },
    { ...valid, correctAnswer: 0 },
    { ...valid, correctAnswer: 5 },
    { ...valid, correctAnswer: 2.5 },
    { ...valid, correctAnswer: "2" },
    { ...valid, explanation: "" },
    "문항",
  ];
  for (const item of cases) {
    assert.equal(parse({ questions: [item] }).ok, false, JSON.stringify(item));
  }
});

test("한 문항의 여러 오류를 모두 알려준다", () => {
  const result = parse({ questions: [{ ...valid, correctAnswer: 7, explanation: "" }] });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errors.length, 2);
  }
});
