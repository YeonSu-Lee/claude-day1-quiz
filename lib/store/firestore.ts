import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../firebase/admin.ts";
import { contentHash, titleKey } from "../quiz/publish.ts";
import type { PaperSummary, Question, QuestionPaper } from "../quiz/types";
import { resultDocId } from "../results/record.ts";
import type { ResultRecord } from "../results/record";

// Firestore 읽기·쓰기는 모두 이 파일을 거칩니다. 권한 확인은 부르는 쪽(app/api/**)에서 먼저 합니다.
//   papers/{id}:  title, titleKey, contentHash, questions(정답·해설 포함), published, ownerEmail, createdAt, updatedAt
//   results/{paperId_이름키}: ResultRecord (같은 문제지·같은 이름은 최신 결과로 덮어씀)

const PAPERS = "papers";
const RESULTS = "results";

type PaperDoc = {
  title: string;
  titleKey: string;
  contentHash: string;
  questions: Question[];
  published: boolean;
  ownerEmail: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type TeacherPaper = {
  id: string;
  title: string;
  questionCount: number;
  published: boolean;
  createdAt: string;
};

function toTeacherPaper(id: string, doc: PaperDoc): TeacherPaper {
  return {
    id,
    title: doc.title,
    questionCount: doc.questions.length,
    published: doc.published,
    createdAt: doc.createdAt.toDate().toISOString(),
  };
}

export type CreatePaperResult =
  | { ok: true; paper: TeacherPaper }
  | { ok: false; reason: "duplicate-title" | "duplicate-content"; existingTitle: string };

/** 같은 제목이나 같은 내용의 문제지가 없으면 비공개 상태로 저장합니다. */
export async function createPaper(title: string, questions: Question[], ownerEmail: string): Promise<CreatePaperResult> {
  const db = adminDb();
  const papers = db.collection(PAPERS);
  const doc: Omit<PaperDoc, "createdAt" | "updatedAt"> = {
    title: title.trim(),
    titleKey: titleKey(title),
    contentHash: contentHash(questions),
    questions,
    published: false,
    ownerEmail,
  };

  return db.runTransaction(async (tx) => {
    const sameTitle = await tx.get(papers.where("titleKey", "==", doc.titleKey).limit(1));
    if (!sameTitle.empty) {
      return { ok: false, reason: "duplicate-title", existingTitle: (sameTitle.docs[0].data() as PaperDoc).title };
    }
    const sameContent = await tx.get(papers.where("contentHash", "==", doc.contentHash).limit(1));
    if (!sameContent.empty) {
      return { ok: false, reason: "duplicate-content", existingTitle: (sameContent.docs[0].data() as PaperDoc).title };
    }
    const ref = papers.doc();
    const now = Timestamp.now();
    const full: PaperDoc = { ...doc, createdAt: now, updatedAt: now };
    tx.create(ref, full);
    return { ok: true, paper: toTeacherPaper(ref.id, full) };
  });
}

/** 교사용: 등록한 모든 문제지(최근 등록 순). */
export async function listTeacherPapers(): Promise<TeacherPaper[]> {
  const snapshot = await adminDb().collection(PAPERS).get();
  return snapshot.docs
    .map((d) => toTeacherPaper(d.id, d.data() as PaperDoc))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** 공개/비공개를 바꿉니다. 문제지가 없으면 null. */
export async function setPaperPublished(id: string, published: boolean): Promise<TeacherPaper | null> {
  const ref = adminDb().collection(PAPERS).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) return null;
  const updatedAt = Timestamp.now();
  await ref.update({ published, updatedAt });
  return toTeacherPaper(id, { ...(snapshot.data() as PaperDoc), published, updatedAt });
}

/** 학생용 목록: 공개된 문제지만(제목 순). */
export async function listPublishedPapers(): Promise<PaperSummary[]> {
  const snapshot = await adminDb().collection(PAPERS).where("published", "==", true).get();
  return snapshot.docs
    .map((d) => {
      const doc = d.data() as PaperDoc;
      return { id: d.id, title: doc.title, questionCount: doc.questions.length };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "ko"));
}

/** 문제지 전체(정답 포함). 서버 안에서 채점·결과 조회에만 씁니다. publishedOnly면 비공개는 null. */
export async function getPaper(id: string, { publishedOnly }: { publishedOnly: boolean }): Promise<QuestionPaper | null> {
  const snapshot = await adminDb().collection(PAPERS).doc(id).get();
  if (!snapshot.exists) return null;
  const doc = snapshot.data() as PaperDoc;
  if (publishedOnly && !doc.published) return null;
  return { id, title: doc.title, questions: doc.questions };
}

/** 최종 제출 결과를 저장합니다. 같은 문제지·같은 이름이면 덮어씁니다. */
export async function saveResult(record: ResultRecord) {
  await adminDb()
    .collection(RESULTS)
    .doc(resultDocId(record.paperId, record.studentName))
    .set({ ...record, submittedAt: Timestamp.fromDate(record.submittedAt) });
}

/** 한 문제지의 결과(이름당 최신 1개). */
export async function listResults(paperId: string): Promise<ResultRecord[]> {
  const snapshot = await adminDb().collection(RESULTS).where("paperId", "==", paperId).get();
  return snapshot.docs.map((d) => {
    const data = d.data();
    return { ...(data as Omit<ResultRecord, "submittedAt">), submittedAt: (data.submittedAt as Timestamp).toDate() };
  });
}
