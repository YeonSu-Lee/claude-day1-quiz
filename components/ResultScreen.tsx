import type { GradeResult } from "@/lib/quiz/score";

type Props = {
  title: string;
  grade: GradeResult;
  onRetry: () => void;
  onBackToList: () => void;
};

function optionText(options: string[], number: number | null) {
  if (number === null) return "선택하지 않음";
  return `${number}. ${options[number - 1]}`;
}

export default function ResultScreen({ title, grade, onRetry, onBackToList }: Props) {
  return (
    <section className="card">
      <p className="paper-title">{title}</p>
      <h1>채점 결과</h1>
      <div className="score-box">
        <p className="score">
          <strong>{grade.score}</strong>점
        </p>
        <p>
          {grade.total}문항 중 {grade.correctCount}개 정답
        </p>
      </div>

      <ol className="result-list">
        {grade.results.map(({ question, selected, isCorrect }, index) => (
          <li key={index} className={`result-item ${isCorrect ? "correct" : "wrong"}`}>
            <p className="result-head">
              <span className="question-no">{index + 1}번</span>
              <span className={`badge ${isCorrect ? "correct" : "wrong"}`}>
                {isCorrect ? "○ 정답" : "✕ 오답"}
              </span>
            </p>
            <p className="result-question">{question.question}</p>
            <dl>
              <dt>내가 고른 답</dt>
              <dd>{optionText(question.options, selected)}</dd>
              <dt>정답</dt>
              <dd>{optionText(question.options, question.correctAnswer)}</dd>
              <dt>해설</dt>
              <dd>{question.explanation}</dd>
            </dl>
          </li>
        ))}
      </ol>

      <div className="actions">
        <button type="button" className="button" onClick={onBackToList}>
          문제지 목록으로
        </button>
        <button type="button" className="button primary" onClick={onRetry}>
          다시 풀기
        </button>
      </div>
    </section>
  );
}
