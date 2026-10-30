"use client";

import { useEffect, useState } from "react";
import PaperListScreen from "@/components/PaperListScreen";
import QuizScreen from "@/components/QuizScreen";
import ResultScreen from "@/components/ResultScreen";
import { gradeQuiz } from "@/lib/quiz/score";
import type { Answers, QuestionPaper } from "@/lib/quiz/types";

type Step = "list" | "solving" | "result";

type Props = {
  papers: QuestionPaper[];
};

export default function QuizApp({ papers }: Props) {
  const [step, setStep] = useState<Step>("list");
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [answers, setAnswers] = useState<Answers>([]);
  const [current, setCurrent] = useState(0);

  // 화면이나 문항이 바뀌면 맨 위부터 보이게 합니다(휴대폰에서 특히 필요).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, current]);

  function startQuiz(selected: QuestionPaper) {
    setPaper(selected);
    setAnswers(selected.questions.map(() => null));
    setCurrent(0);
    setStep("solving");
  }

  function selectAnswer(index: number, option: number) {
    setAnswers((prev) => prev.map((answer, i) => (i === index ? option : answer)));
  }

  function backToList() {
    setPaper(null);
    setAnswers([]);
    setStep("list");
  }

  return (
    <>
      {step === "list" && <PaperListScreen papers={papers} onSelect={startQuiz} />}
      {step === "solving" && paper && (
        <QuizScreen
          title={paper.title}
          questions={paper.questions}
          answers={answers}
          current={current}
          onSelect={selectAnswer}
          onMove={setCurrent}
          onSubmit={() => setStep("result")}
        />
      )}
      {step === "result" && paper && (
        <ResultScreen
          title={paper.title}
          grade={gradeQuiz(paper.questions, answers)}
          onRetry={() => startQuiz(paper)}
          onBackToList={backToList}
        />
      )}
    </>
  );
}
