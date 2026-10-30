import { isRecord, readJson, serverError, teacherDenied } from "@/lib/api/respond";
import { verifyTeacherRequest } from "@/lib/auth/teacher";
import { parseQuizFile } from "@/lib/quiz/parse";
import { createPaper, listTeacherPapers } from "@/lib/store/firestore";

const MAX_FILE_LENGTH = 1_000_000;

// 교사용: 등록한 문제지 목록
export async function GET(request: Request) {
  const check = await verifyTeacherRequest(request);
  if (!check.ok) return teacherDenied(check);
  try {
    return Response.json({ papers: await listTeacherPapers() });
  } catch (error) {
    return serverError(error);
  }
}

// 교사용: 문제지 등록(비공개로 저장). 본문 { text: 업로드한 JSON 파일 내용 }
export async function POST(request: Request) {
  const check = await verifyTeacherRequest(request);
  if (!check.ok) return teacherDenied(check);

  const body = await readJson(request);
  if (!isRecord(body) || typeof body.text !== "string") {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }
  if (body.text.length > MAX_FILE_LENGTH) {
    return Response.json({ error: "invalid-file", errors: ["파일이 너무 큽니다. 1MB보다 작은 파일을 올려 주세요."] }, { status: 400 });
  }

  // 화면에서 검사했더라도 서버에서 같은 규칙으로 다시 검사합니다.
  const parsed = parseQuizFile(body.text);
  if (!parsed.ok) return Response.json({ error: "invalid-file", errors: parsed.errors }, { status: 400 });

  try {
    const result = await createPaper(parsed.title, parsed.questions, check.email);
    if (!result.ok) {
      return Response.json({ error: result.reason, existingTitle: result.existingTitle }, { status: 409 });
    }
    return Response.json({ paper: result.paper }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
