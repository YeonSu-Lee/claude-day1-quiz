import type { Question } from "./types";

export const OPTION_COUNT = 4;

export type ParseResult =
  | { ok: true; title: string; questions: Question[] }
  | { ok: false; errors: string[] };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * 문제지 파일의 글자를 읽어 제목과 문항 목록으로 바꿉니다.
 * 제목이 없거나 잘못된 문항이 하나라도 있으면 파일 전체를 거부하고, 무엇이 잘못됐는지 오류 문구로 돌려줍니다.
 */
export function parseQuizFile(text: string): ParseResult {
  let data: unknown;
  try {
    // 메모장 등에서 저장한 파일 맨 앞의 보이지 않는 표시(BOM)를 지웁니다.
    data = JSON.parse(text.replace(/^﻿/, ""));
  } catch {
    return {
      ok: false,
      errors: ["파일을 읽을 수 없습니다. JSON 형식의 문제 파일인지 확인해 주세요."],
    };
  }

  if (!isRecord(data) || !Array.isArray(data.questions)) {
    return {
      ok: false,
      errors: ["파일 안에 문제 목록(questions)이 없습니다. 파일 형식을 확인해 주세요."],
    };
  }

  if (data.questions.length === 0) {
    return { ok: false, errors: ["문제 목록(questions)에 문항이 하나도 없습니다."] };
  }

  const errors: string[] = [];
  const questions: Question[] = [];
  const { title } = data;

  if (!isNonEmptyString(title)) {
    errors.push("문제지 제목(title)이 비어 있습니다.");
  }

  data.questions.forEach((item: unknown, index: number) => {
    const no = index + 1;
    if (!isRecord(item)) {
      errors.push(`${no}번 문항의 형식이 올바르지 않습니다.`);
      return;
    }

    const itemErrors: string[] = [];
    const { question, options, correctAnswer, explanation } = item;

    if (!isNonEmptyString(question)) {
      itemErrors.push(`${no}번 문항의 문제 내용(question)이 비어 있습니다.`);
    }
    if (!Array.isArray(options) || options.length !== OPTION_COUNT) {
      itemErrors.push(`${no}번 문항의 보기(options)가 ${OPTION_COUNT}개가 아닙니다.`);
    } else if (!options.every((option) => typeof option === "string")) {
      itemErrors.push(`${no}번 문항의 보기(options)는 모두 글자로 적어야 합니다.`);
    }
    if (
      typeof correctAnswer !== "number" ||
      !Number.isInteger(correctAnswer) ||
      correctAnswer < 1 ||
      correctAnswer > OPTION_COUNT
    ) {
      itemErrors.push(
        `${no}번 문항의 정답 번호(correctAnswer)는 1부터 ${OPTION_COUNT} 사이의 숫자여야 합니다.`,
      );
    }
    if (!isNonEmptyString(explanation)) {
      itemErrors.push(`${no}번 문항의 해설(explanation)이 비어 있습니다.`);
    }

    if (itemErrors.length > 0) {
      errors.push(...itemErrors);
      return;
    }
    questions.push({
      question: question as string,
      options: options as string[],
      correctAnswer: correctAnswer as number,
      explanation: explanation as string,
    });
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, title: title as string, questions };
}
