import { isRecord, readJson, serverError, teacherDenied } from "@/lib/api/respond";
import { verifyTeacherRequest } from "@/lib/auth/teacher";
import { setPaperPublished } from "@/lib/store/firestore";

// 교사용: 공개/비공개 바꾸기. 본문 { published: true | false }
export async function PATCH(request: Request, ctx: RouteContext<"/api/teacher/papers/[id]">) {
  const check = await verifyTeacherRequest(request);
  if (!check.ok) return teacherDenied(check);

  const body = await readJson(request);
  if (!isRecord(body) || typeof body.published !== "boolean") {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }

  try {
    const { id } = await ctx.params;
    const paper = await setPaperPublished(id, body.published);
    if (!paper) return Response.json({ error: "not-found" }, { status: 404 });
    return Response.json({ paper });
  } catch (error) {
    return serverError(error);
  }
}
