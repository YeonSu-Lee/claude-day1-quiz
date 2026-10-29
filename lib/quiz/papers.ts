import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseQuizFile } from "./parse.ts";
import type { QuestionPaper } from "./types";

export const PAPERS_DIR = path.join(process.cwd(), "question-papers");

/**
 * 문제지 폴더의 JSON 파일을 파일 이름 순으로 읽습니다.
 * 형식이 잘못된 파일은 목록에서 빼고, 앱을 실행한 창에 이유를 남깁니다.
 * 홈 화면은 빌드할 때 미리 만들어지므로, 번들러가 이 읽기를 따라가지 않도록 turbopackIgnore를 붙였습니다.
 */
export function loadQuestionPapers(dir: string = PAPERS_DIR): QuestionPaper[] {
  const fileNames = readdirSync(/*turbopackIgnore: true*/ dir)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .sort();

  const papers: QuestionPaper[] = [];
  for (const fileName of fileNames) {
    const filePath = path.join(/*turbopackIgnore: true*/ dir, fileName);
    const result = parseQuizFile(readFileSync(/*turbopackIgnore: true*/ filePath, "utf8"));
    if (!result.ok) {
      console.warn(`[문제지 제외] ${fileName}\n  - ${result.errors.join("\n  - ")}`);
      continue;
    }
    papers.push({
      id: fileName.replace(/\.json$/i, ""),
      title: result.title,
      questions: result.questions,
    });
  }
  return papers;
}
