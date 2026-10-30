import { test } from "node:test";
import assert from "node:assert/strict";
import { bearerToken, isAllowedTeacherEmail, verifyTeacherRequest } from "./teacher.ts";

const config = { projectId: "demo-project", teacherEmail: "Teacher@Example.com" };

function requestWith(authorization?: string) {
  const headers: Record<string, string> = authorization === undefined ? {} : { authorization };
  return new Request("http://localhost/api/teacher/me", { headers });
}

test("허용 이메일은 대소문자와 앞뒤 공백을 무시하고 비교한다", () => {
  assert.equal(isAllowedTeacherEmail(" teacher@example.com ", "Teacher@Example.com"), true);
  assert.equal(isAllowedTeacherEmail("other@example.com", "Teacher@Example.com"), false);
  assert.equal(isAllowedTeacherEmail("", ""), false);
});

test("Authorization 머리글에서 Bearer 토큰만 꺼낸다", () => {
  assert.equal(bearerToken(requestWith("Bearer abc.def.ghi")), "abc.def.ghi");
  assert.equal(bearerToken(requestWith("abc")), null);
  assert.equal(bearerToken(requestWith()), null);
});

test("설정이 없으면 누구도 교사로 들이지 않는다", async () => {
  const result = await verifyTeacherRequest(requestWith("Bearer x"), { projectId: "demo-project", teacherEmail: "" });
  assert.deepEqual(result, { ok: false, status: 500, reason: "not-configured" });
});

test("토큰이 없으면 401", async () => {
  const result = await verifyTeacherRequest(requestWith(), config);
  assert.deepEqual(result, { ok: false, status: 401, reason: "no-token" });
});

test("검증할 수 없는 토큰이면 401", async () => {
  const result = await verifyTeacherRequest(requestWith("Bearer not-a-real-token"), config);
  assert.deepEqual(result, { ok: false, status: 401, reason: "invalid-token" });
});
