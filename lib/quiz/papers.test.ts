import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadQuestionPapers } from "./papers.ts";

const question = {
  question: "문제",
  options: ["가", "나", "다", "라"],
  correctAnswer: 1,
  explanation: "해설",
};

test("실제 문제지 폴더에서 예시 문제지를 제목과 함께 읽는다", () => {
  const papers = loadQuestionPapers();
  assert.deepEqual(
    papers.map((paper) => [paper.id, paper.title, paper.questions.length]),
    [["sample-questions", "중학교 정보과목", 10]],
  );
});

test("여러 문제지를 파일 이름 순으로 읽고, 잘못된 파일과 JSON이 아닌 파일은 뺀다", (t) => {
  // 확인용 문제지는 프로젝트 밖 임시 폴더에만 만들고 점검이 끝나면 지웁니다.
  const dir = mkdtempSync(path.join(tmpdir(), "question-papers-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  t.mock.method(console, "warn", () => {});

  writeFileSync(path.join(dir, "02-b.json"), JSON.stringify({ title: "둘째", questions: [question, question] }));
  writeFileSync(path.join(dir, "01-a.json"), JSON.stringify({ title: "첫째", questions: [question] }));
  writeFileSync(path.join(dir, "03-bad.json"), JSON.stringify({ questions: [question] }));
  writeFileSync(path.join(dir, "memo.txt"), "문제지가 아닙니다");

  const papers = loadQuestionPapers(dir);
  assert.deepEqual(
    papers.map((paper) => [paper.id, paper.title, paper.questions.length]),
    [
      ["01-a", "첫째", 1],
      ["02-b", "둘째", 2],
    ],
  );
});
