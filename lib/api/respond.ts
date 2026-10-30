import { ServerNotConfiguredError } from "../firebase/admin.ts";
import type { TeacherCheck } from "../auth/teacher";

/** 예상하지 못한 서버 오류를 서버 창에 남기고, 화면에는 짧은 오류 코드만 돌려줍니다. */
export function serverError(error: unknown) {
  if (error instanceof ServerNotConfiguredError) {
    console.warn(error.message);
    return Response.json({ error: "not-configured" }, { status: 500 });
  }
  console.error("[server error]", error);
  return Response.json({ error: "server-error" }, { status: 500 });
}

/** 교사 확인에 실패했을 때의 응답. */
export function teacherDenied(check: Exclude<TeacherCheck, { ok: true }>) {
  return Response.json({ error: check.reason }, { status: check.status });
}

/** JSON 요청 본문을 읽습니다. 형식이 틀리면 null. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
