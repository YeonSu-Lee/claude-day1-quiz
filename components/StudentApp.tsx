"use client";

import { useState } from "react";
import QuizApp from "@/components/QuizApp";
import StudentNameScreen from "@/components/StudentNameScreen";

// 학생 이름은 브라우저에 저장하지 않습니다. 새로고침하면 이름 입력부터 다시 합니다.
// 이름은 최종 제출할 때 결과와 함께 서버에 저장됩니다.
export default function StudentApp() {
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
          <QuizApp studentName={studentName} />
        </>
      )}
    </main>
  );
}
