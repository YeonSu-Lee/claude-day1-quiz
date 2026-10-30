import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// 서버 전용 Firestore 연결입니다. 비밀키는 .env.local(이 컴퓨터) 또는 배포 서비스의 환경변수에만 둡니다.
// 브라우저 코드에서 불러오면 안 됩니다(app/api/** 에서만 사용).
export class ServerNotConfiguredError extends Error {}

export function adminDb() {
  if (getApps().length > 0) return getFirestore(getApp());

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    throw new ServerNotConfiguredError(
      "Firestore 서버 설정이 없습니다: NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY를 확인하세요.",
    );
  }

  const app = initializeApp({
    projectId,
    credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, "\n") }),
  });
  return getFirestore(app);
}
