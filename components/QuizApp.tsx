"use client";

import { useCallback, useEffect, useState } from "react";
import PaperListScreen from "@/components/PaperListScreen";
import QuizScreen from "@/components/QuizScreen";
import ResultScreen from "@/components/ResultScreen";
import type { GradeResult } from "@/lib/quiz/score";
import type { Answers, PaperSummary, PublicPaper } from "@/lib/quiz/types";

type Step = "list" | "solving" | "result";

type Props = {
  studentName: string;
};

const LOAD_ERROR = "문제지를 불러오지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.";

// 문제지 목록과 문제는 서버에서 받습니다. 풀이 중에는 정답·해설이 없고,
// 최종 제출 때 서버가 채점·저장한 뒤 돌려준 결과로 결과 화면을 보여줍니다.
export default function QuizApp({ studentName }: Props) {
  const [step, setStep] = useState<Step>("list");
  const [papers, setPapers] = useState<PaperSummary[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [paper, setPaper] = useState<PublicPaper | null>(null);
  const [answers, setAnswers] = useState<Answers>([]);
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [grade, setGrade] = useState<GradeResult | null>(null);

  // 화면이나 문항이 바뀌면 맨 위부터 보이게 합니다(휴대폰에서 특히 필요).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, current]);

  const loadPapers = useCallback(async () => {
    setListError(null);
    try {
      const response = await fetch("/api/papers", { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      setPapers(((await response.json()) as { papers: PaperSummary[] }).papers);
    } catch {
      setListError(LOAD_ERROR);
    }
  }, []);

  useEffect(() => {
    // 처음 들어왔을 때 목록을 받습니다(교사가 바꾼 공개 상태가 바로 반영됨).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPapers();
  }, [loadPapers]);

  function startQuiz(selected: PublicPaper) {
    setPaper(selected);
    setAnswers(selected.questions.map(() => null));
    setCurrent(0);
    setSubmitError(null);
    setGrade(null);
    setStep("solving");
  }

  async function openPaper(summary: PaperSummary) {
    setOpening(true);
    setListError(null);
    try {
      const response = await fetch(`/api/papers/${encodeURIComponent(summary.id)}`, { cache: "no-store" });
      if (response.status === 404) {
        setListError("이 문제지는 지금 풀 수 없습니다. 목록을 새로 불러왔습니다.");
        await loadPapers();
        return;
      }
      if (!response.ok) throw new Error(String(response.status));
      startQuiz(((await response.json()) as { paper: PublicPaper }).paper);
    } catch {
      setListError(LOAD_ERROR);
    } finally {
      setOpening(false);
    }
  }

  function selectAnswer(index: number, option: number) {
    setAnswers((prev) => prev.map((answer, i) => (i === index ? option : answer)));
  }

  async function submit() {
    if (!paper) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(`/api/papers/${encodeURIComponent(paper.id)}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, answers }),
      });
      if (response.status === 404) {
        setSubmitError("이 문제지는 더 이상 공개되어 있지 않아 제출할 수 없습니다. 선생님께 문의해 주세요.");
        return;
      }
      if (!response.ok) throw new Error(String(response.status));
      setGrade(((await response.json()) as { grade: GradeResult }).grade);
      setStep("result");
    } catch {
      setSubmitError(
        "결과를 저장하지 못했습니다. 인터넷 연결을 확인하고 \"채점하기\"를 다시 눌러 주세요. 고른 답은 그대로 남아 있습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function backToList() {
    setPaper(null);
    setAnswers([]);
    setGrade(null);
    setStep("list");
    void loadPapers();
  }

  return (
    <>
      {step === "list" && (
        <PaperListScreen
          papers={papers}
          error={listError}
          busy={opening}
          onSelect={openPaper}
          onReload={loadPapers}
        />
      )}
      {step === "solving" && paper && (
        <QuizScreen
          title={paper.title}
          questions={paper.questions}
          answers={answers}
          current={current}
          submitting={submitting}
          submitError={submitError}
          onSelect={selectAnswer}
          onMove={setCurrent}
          onSubmit={submit}
        />
      )}
      {step === "result" && paper && grade && (
        <ResultScreen title={paper.title} grade={grade} onRetry={() => startQuiz(paper)} onBackToList={backToList} />
      )}
    </>
  );
}
