"use client";

import { useState, type ChangeEvent } from "react";
import { parseQuizFile } from "@/lib/quiz/parse";
import type { Question } from "@/lib/quiz/types";

type Props = {
  onLoaded: (questions: Question[], fileName: string) => void;
};

export default function UploadScreen({ onLoaded }: Props) {
  const [errors, setErrors] = useState<string[]>([]);
  const [failedFileName, setFailedFileName] = useState("");

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    // 같은 파일을 고쳐서 다시 선택해도 인식되도록 선택 상태를 비웁니다.
    input.value = "";
    if (!file) return;

    let text: string;
    try {
      text = await file.text();
    } catch {
      setFailedFileName(file.name);
      setErrors(["파일을 열 수 없습니다. 다른 파일을 선택해 주세요."]);
      return;
    }

    const result = parseQuizFile(text);
    if (result.ok) {
      onLoaded(result.questions, file.name);
    } else {
      setFailedFileName(file.name);
      setErrors(result.errors);
    }
  }

  return (
    <section className="card">
      <h1>문제풀이</h1>
      <p className="lead">선생님께 받은 문제 파일(JSON)을 선택해 주세요.</p>
      <p className="hint">파일을 선택하면 문항을 먼저 확인한 뒤 풀이를 시작할 수 있습니다.</p>

      <label className="button primary file-button">
        파일 선택
        <input
          type="file"
          accept=".json,application/json"
          onChange={handleChange}
          className="visually-hidden"
        />
      </label>

      {errors.length > 0 && (
        <div className="error-box" role="alert">
          <p className="error-title">「{failedFileName}」 파일을 사용할 수 없습니다.</p>
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
          <p>파일 내용을 고친 뒤 다시 선택해 주세요.</p>
        </div>
      )}
    </section>
  );
}
