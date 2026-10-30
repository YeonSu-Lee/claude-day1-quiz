import { isRecord, readJson, serverError } from "@/lib/api/respond";
import { OPTION_COUNT } from "@/lib/quiz/parse";
import { gradeQuiz } from "@/lib/quiz/score";
import { buildResultRecord, cleanStudentName, MAX_STUDENT_NAME_LENGTH } from "@/lib/results/record";
import { getPaper, saveResult } from "@/lib/store/firestore";

// 학생용: 최종 제출. 본문 { studentName, answers: 문항별 보기 번호 }
// 서버가 채점해 저장한 뒤에만 점수·정답·해설을 돌려줍니다.
export async function POST(request: Request, ctx: RouteContext<"/api/papers/[id]/submissions">) {
  const body = await readJson(request);
  if (!isRecord(body) || typeof body.studentName !== "string" || !Array.isArray(body.answers)) {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }
  const studentName = cleanStudentName(body.studentName);
  if (studentName === "" || studentName.length > MAX_STUDENT_NAME_LENGTH) {
    return Response.json({ error: "bad-name" }, { status: 400 });
  }

  try {
    const { id } = await ctx.params;
    const paper = await getPaper(id, { publishedOnly: true });
    if (!paper) return Response.json({ error: "not-found" }, { status: 404 });

    const answers = body.answers;
    const allAnswered =
      answers.length === paper.questions.length &&
      answers.every((a) => typeof a === "number" && Number.isInteger(a) && a >= 1 && a <= OPTION_COUNT);
    if (!allAnswered) return Response.json({ error: "incomplete-answers" }, { status: 400 });

    const grade = gradeQuiz(paper.questions, answers as number[]);
    await saveResult(buildResultRecord(paper, studentName, answers as number[], grade, new Date()));
    return Response.json({ grade });
  } catch (error) {
    return serverError(error);
  }
}
