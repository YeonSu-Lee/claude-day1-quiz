"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";

type Status =
  | { kind: "checking" }
  | { kind: "signed-out" }
  | { kind: "allowed"; email: string }
  | { kind: "denied"; email: string };

// 로그인 오류를 쉬운 말로 바꿉니다. 창을 닫은 경우처럼 안내가 필요 없으면 null.
function signInErrorMessage(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return null;
    case "auth/popup-blocked":
      return "로그인 창이 차단되었습니다. 브라우저 주소창 오른쪽의 팝업 차단 표시를 눌러 허용한 뒤 다시 시도해 주세요.";
    case "auth/operation-not-allowed":
    case "auth/configuration-not-found":
      return "Firebase에서 Google 로그인이 아직 켜져 있지 않습니다. 관리자에게 알려 주세요.";
    case "auth/unauthorized-domain":
      return "이 주소는 Firebase 로그인 허용 주소에 등록되어 있지 않습니다. 관리자에게 알려 주세요.";
    case "auth/network-request-failed":
      return "인터넷 연결을 확인한 뒤 다시 시도해 주세요.";
    default:
      return "로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }
}

// 교사 여부는 화면이 아니라 서버(/api/teacher/me)가 판단합니다.
async function askServer(user: User): Promise<Status> {
  const token = await user.getIdToken();
  const response = await fetch("/api/teacher/me", { headers: { Authorization: `Bearer ${token}` } });
  if (response.ok) {
    const body = (await response.json()) as { email: string };
    return { kind: "allowed", email: body.email };
  }
  if (response.status === 403) return { kind: "denied", email: user.email ?? "" };
  throw new Error(`teacher check failed: ${response.status}`);
}

export default function TeacherScreen() {
  const [status, setStatus] = useState<Status>({ kind: "checking" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth(), (user) => {
      if (!user) {
        setStatus({ kind: "signed-out" });
        return;
      }
      setStatus({ kind: "checking" });
      askServer(user)
        .then(setStatus)
        .catch(() => {
          setError("로그인한 계정을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
          setStatus({ kind: "signed-out" });
        });
    });
  }, []);

  async function handleSignIn() {
    setError(null);
    const provider = new GoogleAuthProvider();
    // 여러 Google 계정을 쓰는 컴퓨터에서도 계정을 고를 수 있게 합니다.
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(firebaseAuth(), provider);
    } catch (e) {
      setError(signInErrorMessage(e));
    }
  }

  async function handleSignOut() {
    setError(null);
    await signOut(firebaseAuth());
  }

  return (
    <section className="card">
      <p className="paper-title">교사 화면</p>
      <h1>선생님 화면</h1>

      {status.kind === "checking" && <p className="lead">로그인 상태를 확인하고 있습니다…</p>}

      {status.kind === "signed-out" && (
        <>
          <p className="lead">허용된 선생님 Google 계정으로 로그인해 주세요.</p>
          <p className="hint">학생은 로그인하지 않고 첫 화면의 &ldquo;학생으로 시작하기&rdquo;로 들어가면 됩니다.</p>
          <div className="actions">
            <button type="button" className="button primary" onClick={handleSignIn}>
              Google로 로그인
            </button>
          </div>
        </>
      )}

      {status.kind === "denied" && (
        <>
          <p className="notice notice-wrong" role="alert">
            <strong>{status.email}</strong> 계정은 교사로 허용되지 않은 계정입니다. 로그아웃한 뒤 허용된 선생님 계정으로
            다시 로그인해 주세요.
          </p>
          <div className="actions">
            <button type="button" className="button primary" onClick={handleSignOut}>
              로그아웃
            </button>
          </div>
        </>
      )}

      {status.kind === "allowed" && (
        <>
          <div className="account-bar">
            <span>
              <strong>{status.email}</strong> 계정으로 로그인했습니다.
            </span>
            <button type="button" className="button small" onClick={handleSignOut}>
              로그아웃
            </button>
          </div>
          <p className="lead">문제를 등록하고 학생들의 풀이 결과를 확인하는 곳입니다.</p>

          <div className="panel">
            <h2>문제 등록</h2>
            <p className="hint">
              준비 중입니다. 지금은 문제지 파일을 앱의 question-papers 폴더에 넣어야 학생 화면 목록에 나타납니다.
            </p>
          </div>

          <div className="panel">
            <h2>학생 풀이 결과</h2>
            <p className="hint">준비 중입니다. 풀이 결과 저장이 연결되면 학생별 점수를 이곳에서 볼 수 있습니다.</p>
          </div>
        </>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="actions">
        <Link href="/" className="button">
          첫 화면으로
        </Link>
      </div>
    </section>
  );
}
