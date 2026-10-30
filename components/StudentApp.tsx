"use client";

import { useState } from "react";
import QuizApp from "@/components/QuizApp";
import StudentNameScreen from "@/components/StudentNameScreen";
import type { QuestionPaper } from "@/lib/quiz/types";

type Props = {
  papers: QuestionPaper[];
};

// 학생 이름도 풀이 상태처럼 어디에도 저장하지 않습니다. 새로고침하면 이름 입력부터 다시 합니다.
export default function StudentApp({ papers }: Props) {
  const [studentName, setStudentName] = useState<string | null>(null);

  return (
    <main className="container">
      {studentName === null ? (
        <StudentNameScreen onEnter={setStudentName} />
      ) : (
        <>
          <div className="student-bar">
            <span>
              <strong>{studentName}</strong> 학생
            </span>
            <button type="button" className="button small" onClick={() => setStudentName(null)}>
              나가기
            </button>
          </div>
          <QuizApp papers={papers} />
        </>
      )}
    </main>
  );
}
