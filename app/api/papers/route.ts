import { serverError } from "@/lib/api/respond";
import { listPublishedPapers } from "@/lib/store/firestore";

export const dynamic = "force-dynamic";

// 학생용: 공개된 문제지 목록(제목과 문항 수만)
export async function GET() {
  try {
    return Response.json({ papers: await listPublishedPapers() });
  } catch (error) {
    return serverError(error);
  }
}
