import { verifyTeacherRequest } from "@/lib/auth/teacher";

// 화면이 "지금 로그인한 사람이 허용된 교사인가"를 서버에 묻는 곳입니다.
export async function GET(request: Request) {
  const check = await verifyTeacherRequest(request);
  if (!check.ok) {
    const body = check.reason === "not-allowed" ? { error: check.reason, email: check.email } : { error: check.reason };
    return Response.json(body, { status: check.status });
  }
  return Response.json({ email: check.email });
}
