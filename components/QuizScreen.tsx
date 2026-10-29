import type { Answers, Question } from "@/lib/quiz/types";

type Props = {
  questions: Question[];
  answers: Answers;
  current: number;
  onSelect: (index: number, option: number) => void;
  onMove: (index: number) => void;
  onSubmit: () => void;
};

export default function QuizScreen({ questions, answers, current, onSelect, onMove, onSubmit }: Props) {
  const total = questions.length;
  const question = questions[current];
  const isLast = current === total - 1;
  const answeredCount = answers.filter((answer) => answer !== null).length;
  const unanswered = answers.flatMap((answer, index) => (answer === null ? [index] : []));

  return (
    <section className="card">
      <div className="progress-header">
        <span className="progress-count">
          {current + 1} / {total}
        </span>
        <span className="hint">
          답한 문항 {answeredCount} / {total}
        </span>
      </div>
      <div className="progress-bar" aria-hidden="true">
        <div style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      <fieldset className="question">
        <legend>
          <span className="question-no">{current + 1}번</span> {question.question}
        </legend>
        <div className="options">
          {question.options.map((option, optionIndex) => {
            const value = optionIndex + 1;
            const checked = answers[current] === value;
            return (
              <label key={optionIndex} className={`option${checked ? " selected" : ""}`}>
                <input
                  type="radio"
                  name={`question-${current}`}
                  value={value}
                  checked={checked}
                  onChange={() => onSelect(current, value)}
                />
                <span className="option-no">{value}</span>
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="actions">
        <button
          type="button"
          className="button"
          onClick={() => onMove(current - 1)}
          disabled={current === 0}
        >
          이전
        </button>
        {isLast ? (
          <button
            type="button"
            className="button primary"
            onClick={onSubmit}
            disabled={unanswered.length > 0}
          >
            채점하기
          </button>
        ) : (
          <button type="button" className="button primary" onClick={() => onMove(current + 1)}>
            다음
          </button>
        )}
      </div>

      {isLast && unanswered.length > 0 && (
        <div className="notice" role="status">
          <p>아직 답하지 않은 문항이 있습니다. 모든 문항에 답해야 채점할 수 있습니다.</p>
          <div className="jump-list">
            {unanswered.map((index) => (
              <button key={index} type="button" className="button small" onClick={() => onMove(index)}>
                {index + 1}번으로 가기
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
