import { serverError, teacherDenied } from "@/lib/api/respond";
import { verifyTeacherRequest } from "@/lib/auth/teacher";
import { summarizeResults } from "@/lib/results/record";
import { getPaper, listResults } from "@/lib/store/firestore";

// 교사용: 한 문제지의 학생 결과표와 평균
export async function GET(request: Request, ctx: RouteContext<"/api/teacher/papers/[id]/results">) {
  const check = await verifyTeacherRequest(request);
  if (!check.ok) return teacherDenied(check);

  try {
    const { id } = await ctx.params;
    const paper = await getPaper(id, { publishedOnly: false });
    if (!paper) return Response.json({ error: "not-found" }, { status: 404 });
    const summary = summarizeResults(await listResults(id));
    return Response.json({ paper: { id: paper.id, title: paper.title, questionCount: paper.questions.length }, ...summary });
  } catch (error) {
    return serverError(error);
  }
}
