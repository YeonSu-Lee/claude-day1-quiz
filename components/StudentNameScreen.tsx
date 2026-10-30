"use client";

import { useState } from "react";

type Props = {
  onEnter: (name: string) => void;
};

export default function StudentNameScreen({ onEnter }: Props) {
  const [name, setName] = useState("");
  const [showError, setShowError] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === "") {
      setShowError(true);
      return;
    }
    onEnter(trimmed);
  }

  return (
    <section className="card">
      <p className="paper-title">학생 화면</p>
      <h1>이름을 입력해 주세요</h1>
      <p className="hint">회원가입이나 로그인 없이 이름만 입력하면 문제를 풀 수 있습니다.</p>
      <form className="name-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="student-name">이름</label>
        <input
          id="student-name"
          type="text"
          autoComplete="off"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setShowError(false);
          }}
          aria-invalid={showError}
          aria-describedby={showError ? "student-name-error" : undefined}
        />
        {showError && (
          <p id="student-name-error" className="error" role="alert">
            이름을 입력해 주세요.
          </p>
        )}
        <div className="actions">
          <button type="submit" className="button primary">
            들어가기
          </button>
        </div>
      </form>
    </section>
  );
}
