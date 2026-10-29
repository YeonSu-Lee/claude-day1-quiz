"use client";

import { useEffect, useState } from "react";
import UploadScreen from "@/components/UploadScreen";
import PreviewScreen from "@/components/PreviewScreen";
import QuizScreen from "@/components/QuizScreen";
import ResultScreen from "@/components/ResultScreen";
import { gradeQuiz } from "@/lib/quiz/score";
import type { Answers, Question } from "@/lib/quiz/types";

type Step = "upload" | "preview" | "solving" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answers>([]);
  const [current, setCurrent] = useState(0);

  // 화면이나 문항이 바뀌면 맨 위부터 보이게 합니다(휴대폰에서 특히 필요).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, current]);

  function handleLoaded(loaded: Question[], name: string) {
    setQuestions(loaded);
    setFileName(name);
    setStep("preview");
  }

  function startQuiz() {
    setAnswers(questions.map(() => null));
    setCurrent(0);
    setStep("solving");
  }

  function selectAnswer(index: number, option: number) {
    setAnswers((prev) => prev.map((answer, i) => (i === index ? option : answer)));
  }

  function chooseNewFile() {
    setQuestions([]);
    setAnswers([]);
    setFileName("");
    setStep("upload");
  }

  return (
    <main className="container">
      {step === "upload" && <UploadScreen onLoaded={handleLoaded} />}
      {step === "preview" && (
        <PreviewScreen
          fileName={fileName}
          questions={questions}
          onStart={startQuiz}
          onChooseOther={chooseNewFile}
        />
      )}
      {step === "solving" && (
        <QuizScreen
          questions={questions}
          answers={answers}
          current={current}
          onSelect={selectAnswer}
          onMove={setCurrent}
          onSubmit={() => setStep("result")}
        />
      )}
      {step === "result" && (
        <ResultScreen
          grade={gradeQuiz(questions, answers)}
          onRetry={startQuiz}
          onChooseNewFile={chooseNewFile}
        />
      )}
    </main>
  );
}
