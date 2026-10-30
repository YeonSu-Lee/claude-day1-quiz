"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { parseQuizFile } from "@/lib/quiz/parse";
import type { Question } from "@/lib/quiz/types";
import type { ResultRow } from "@/lib/results/record";
import type { TeacherPaper } from "@/lib/store/firestore";

type Props = {
  user: User;
};

type Preview = { fileName: string; text: string; title: string; questions: Question[] };

type ResultsView = {
  paperId: string;
  data: { rows: ResultRow[]; average: number | null } | null;
  error: string | null;
};

const SERVER_ERROR = "서버와 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.";

// 서버 응답 코드를 쉬운 안내로 바꿉니다.
function errorMessage(status: number, body: { error?: string; existingTitle?: string }) {
  if (status === 401 || status === 403) return "선생님 계정 확인에 실패했습니다. 로그아웃한 뒤 다시 로그인해 주세요.";
  if (body.error === "duplicate-title") {
    return `같은 제목의 문제지 "${body.existingTitle}"이(가) 이미 등록되어 있습니다. 제목을 바꾸거나 다른 파일을 올려 주세요.`;
  }
  if (body.error === "duplicate-content") {
    return `내용이 같은 문제지가 이미 "${body.existingTitle}"(이)라는 제목으로 등록되어 있습니다.`;
  }
  if (body.error === "not-found") return "문제지를 찾을 수 없습니다. 목록을 새로 불러와 주세요.";
  if (body.error === "not-configured") return "서버에 Firestore 설정이 없습니다. 관리자에게 알려 주세요.";
  return SERVER_ERROR;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
}

export default function TeacherDashboard({ user }: Props) {
  const [papers, setPapers] = useState<TeacherPaper[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyPaperId, setBusyPaperId] = useState<string | null>(null);
  const [results, setResults] = useState<ResultsView | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  // 교사용 서버 요청에는 항상 로그인 확인 정보(ID 토큰)를 붙입니다. 서버가 계정을 다시 확인합니다.
  const api = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const token = await user.getIdToken();
      const response = await fetch(path, {
        ...init,
        cache: "no-store",
        headers: { ...init.headers, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const body = await response.json().catch(() => ({}));
      return { response, body };
    },
    [user],
  );

  const loadPapers = useCallback(async () => {
    setListError(null);
    try {
      const { response, body } = await api("/api/teacher/papers");
      if (!response.ok) {
        setListError(errorMessage(response.status, body));
        return;
      }
      setPapers((body as { papers: TeacherPaper[] }).papers);
    } catch {
      setListError(SERVER_ERROR);
    }
  }, [api]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPapers();
  }, [loadPapers]);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreview(null);
    setFileErrors([]);
    setUploadMessage(null);
    if (!file) return;
    const text = await file.text();
    const parsed = parseQuizFile(text);
    if (!parsed.ok) {
      setFileErrors(parsed.errors);
      return;
    }
    setPreview({ fileName: file.name, text, title: parsed.title, questions: parsed.questions });
  }

  function resetUpload() {
    setPreview(null);
    setFileErrors([]);
    setFileInputKey((key) => key + 1);
  }

  async function savePreview() {
    if (!preview) return;
    setSaving(true);
    setUploadMessage(null);
    setFileErrors([]);
    try {
      const { response, body } = await api("/api/teacher/papers", {
        method: "POST",
        body: JSON.stringify({ text: preview.text }),
      });
      if (response.status === 400 && Array.isArray(body.errors)) {
        setFileErrors(body.errors as string[]);
        return;
      }
      if (!response.ok) {
        setFileErrors([errorMessage(response.status, body)]);
        return;
      }
      setUploadMessage(`"${preview.title}"을(를) 저장했습니다. 아직 학생에게 공개되지 않았습니다. 아래 목록에서 "공개하기"를 눌러 주세요.`);
      resetUpload();
      await loadPapers();
    } catch {
      setFileErrors([SERVER_ERROR]);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(paper: TeacherPaper) {
    setBusyPaperId(paper.id);
    setListError(null);
    try {
      const { response, body } = await api(`/api/teacher/papers/${encodeURIComponent(paper.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ published: !paper.published }),
      });
      if (!response.ok) {
        setListError(errorMessage(response.status, body));
        return;
      }
      const updated = (body as { paper: TeacherPaper }).paper;
      setPapers((prev) => prev?.map((p) => (p.id === updated.id ? updated : p)) ?? prev);
    } catch {
      setListError(SERVER_ERROR);
    } finally {
      setBusyPaperId(null);
    }
  }

  async function showResults(paperId: string) {
    if (results?.paperId === paperId) {
      setResults(null);
      return;
    }
    setResults({ paperId, data: null, error: null });
    try {
      const { response, body } = await api(`/api/teacher/papers/${encodeURIComponent(paperId)}/results`);
      if (!response.ok) {
        setResults({ paperId, data: null, error: errorMessage(response.status, body) });
        return;
      }
      setResults({ paperId, data: body as { rows: ResultRow[]; average: number | null }, error: null });
    } catch {
      setResults({ paperId, data: null, error: SERVER_ERROR });
    }
  }

  return (
    <>
      <div className="panel">
        <h2>문제지 등록</h2>
        <p className="hint">문제지 JSON 파일을 고르면 내용을 먼저 보여 드립니다. 확인한 뒤 저장하세요.</p>
        <input
          key={fileInputKey}
          className="file-input"
          type="file"
          accept=".json,application/json"
          aria-label="문제지 JSON 파일 고르기"
          onChange={handleFile}
        />

        {fileErrors.length > 0 && (
          <div className="notice notice-wrong" role="alert">
            <p>
              <strong>이 파일은 저장할 수 없습니다.</strong>
            </p>
            <ul className="error-list">
              {fileErrors.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        {uploadMessage && (
          <p className="notice" role="status">
            {uploadMessage}
          </p>
        )}

        {preview && (
          <div className="preview">
            <p className="paper-title">{preview.fileName}</p>
            <h3>{preview.title}</h3>
            <p className="hint">{preview.questions.length}문항 · 저장하면 비공개 상태로 등록됩니다.</p>
            <ol className="result-list">
              {preview.questions.map((q, index) => (
                <li key={index} className="result-item">
                  <p className="result-question">
                    <span className="question-no">{index + 1}번</span> {q.question}
                  </p>
                  <ol className="preview-options">
                    {q.options.map((option, optionIndex) => (
                      <li key={optionIndex} className={optionIndex + 1 === q.correctAnswer ? "correct-option" : undefined}>
                        {option}
                        {optionIndex + 1 === q.correctAnswer && <span className="badge correct">정답</span>}
                      </li>
                    ))}
                  </ol>
                  <dl>
                    <dt>해설</dt>
                    <dd>{q.explanation}</dd>
                  </dl>
                </li>
              ))}
            </ol>
            <div className="actions">
              <button type="button" className="button" onClick={resetUpload} disabled={saving}>
                취소
              </button>
              <button type="button" className="button primary" onClick={savePreview} disabled={saving}>
                {saving ? "저장하는 중…" : "저장하기"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="panel">
        <h2>등록한 문제지와 학생 결과</h2>
        {listError && (
          <div className="notice notice-wrong" role="alert">
            <p>{listError}</p>
            <button type="button" className="button small" onClick={loadPapers}>
              다시 불러오기
            </button>
          </div>
        )}
        {papers === null ? (
          !listError && <p className="hint">불러오고 있습니다…</p>
        ) : papers.length === 0 ? (
          <p className="hint">아직 등록한 문제지가 없습니다.</p>
        ) : (
          <ul className="teacher-papers">
            {papers.map((paper) => (
              <li key={paper.id} className="teacher-paper">
                <div className="teacher-paper-head">
                  <div>
                    <strong>{paper.title}</strong>
                    <span className="hint"> · {paper.questionCount}문항</span>
                  </div>
                  <span className={`badge ${paper.published ? "correct" : "muted"}`}>
                    {paper.published ? "공개 중" : "비공개"}
                  </span>
                </div>
                <div className="teacher-paper-actions">
                  <button
                    type="button"
                    className={`button small${paper.published ? "" : " primary"}`}
                    onClick={() => togglePublished(paper)}
                    disabled={busyPaperId === paper.id}
                  >
                    {paper.published ? "비공개로 바꾸기" : "공개하기"}
                  </button>
                  <button type="button" className="button small" onClick={() => showResults(paper.id)}>
                    {results?.paperId === paper.id ? "결과 닫기" : "결과 보기"}
                  </button>
                </div>

                {results?.paperId === paper.id && (
                  <div className="results-box">
                    {results.error && (
                      <p className="error" role="alert">
                        {results.error}
                      </p>
                    )}
                    {!results.error && !results.data && <p className="hint">불러오고 있습니다…</p>}
                    {results.data && results.data.rows.length === 0 && (
                      <p className="hint">아직 제출한 학생이 없습니다.</p>
                    )}
                    {results.data && results.data.rows.length > 0 && (
                      <>
                        <p>
                          평균 <strong>{results.data.average}점</strong> ({results.data.rows.length}명, 이름별 최신 결과
                          기준)
                        </p>
                        <div className="table-wrap">
                          <table className="results-table">
                            <thead>
                              <tr>
                                <th scope="col">이름</th>
                                <th scope="col">점수</th>
                                <th scope="col">틀린 문제</th>
                                <th scope="col">제출 시각</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.data.rows.map((row) => (
                                <tr key={row.studentName}>
                                  <td>{row.studentName}</td>
                                  <td>{row.score}점</td>
                                  <td>
                                    {row.wrongQuestions.length === 0
                                      ? "없음"
                                      : `${row.wrongQuestions.join(", ")}번`}
                                  </td>
                                  <td>{formatTime(row.submittedAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
