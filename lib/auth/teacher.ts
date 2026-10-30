import { createRemoteJWKSet, jwtVerify } from "jose";

// 서버에서 교사 요청을 확인합니다. 화면에서 보낸 Firebase ID 토큰을 Google 공개키로 검증하고,
// Google 계정으로 로그인했으며 이메일이 TEACHER_EMAIL과 같은지 봅니다.
// 앞으로 만들 교사용 API도 모두 verifyTeacherRequest()를 먼저 거치게 합니다.

const FIREBASE_PUBLIC_KEYS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export type TeacherCheck =
  | { ok: true; email: string }
  | { ok: false; status: 401; reason: "no-token" | "invalid-token" }
  | { ok: false; status: 403; reason: "not-allowed"; email: string }
  | { ok: false; status: 500; reason: "not-configured" };

export type TeacherAuthConfig = {
  projectId: string | undefined;
  teacherEmail: string | undefined;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAllowedTeacherEmail(email: string, teacherEmail: string) {
  return normalizeEmail(email) !== "" && normalizeEmail(email) === normalizeEmail(teacherEmail);
}

export function bearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

export async function verifyTeacherRequest(
  request: Request,
  config: TeacherAuthConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    teacherEmail: process.env.TEACHER_EMAIL,
  },
): Promise<TeacherCheck> {
  const { projectId, teacherEmail } = config;
  if (!projectId || !teacherEmail) {
    console.warn("교사 로그인 설정이 없습니다: NEXT_PUBLIC_FIREBASE_PROJECT_ID와 TEACHER_EMAIL을 확인하세요.");
    return { ok: false, status: 500, reason: "not-configured" };
  }

  const token = bearerToken(request);
  if (!token) return { ok: false, status: 401, reason: "no-token" };

  let payload;
  try {
    ({ payload } = await jwtVerify(token, FIREBASE_PUBLIC_KEYS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    }));
  } catch {
    return { ok: false, status: 401, reason: "invalid-token" };
  }

  const firebase = payload.firebase as { sign_in_provider?: unknown } | undefined;
  const email = typeof payload.email === "string" ? payload.email : "";
  if (
    typeof payload.sub !== "string" ||
    payload.sub === "" ||
    payload.email_verified !== true ||
    firebase?.sign_in_provider !== "google.com" ||
    !isAllowedTeacherEmail(email, teacherEmail)
  ) {
    return { ok: false, status: 403, reason: "not-allowed", email };
  }

  return { ok: true, email };
}
