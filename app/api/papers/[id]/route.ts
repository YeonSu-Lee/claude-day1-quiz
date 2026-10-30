import { serverError } from "@/lib/api/respond";
import { toPublicQuestions } from "@/lib/quiz/publish";
import { getPaper } from "@/lib/store/firestore";

// 학생용: 공개된 문제지의 문제와 보기. 정답·해설은 보내지 않습니다.
export async function GET(_request: Request, ctx: RouteContext<"/api/papers/[id]">) {
  try {
    const { id } = await ctx.params;
    const paper = await getPaper(id, { publishedOnly: true });
    if (!paper) return Response.json({ error: "not-found" }, { status: 404 });
    return Response.json({ paper: { id: paper.id, title: paper.title, questions: toPublicQuestions(paper.questions) } });
  } catch (error) {
    return serverError(error);
  }
}
