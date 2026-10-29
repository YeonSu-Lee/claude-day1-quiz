import type { Question } from "@/lib/quiz/types";

type Props = {
  fileName: string;
  questions: Question[];
  onStart: () => void;
  onChooseOther: () => void;
};

export default function PreviewScreen({ fileName, questions, onStart, onChooseOther }: Props) {
  return (
    <section className="card">
      <h1>문항 확인</h1>
      <p className="lead">
        「{fileName}」에서 <strong>총 {questions.length}문항</strong>을 불러왔습니다.
      </p>
      <p className="hint">한 문제씩 풀고, 마지막 문항까지 답한 뒤 한 번에 채점합니다.</p>

      <ol className="preview-list">
        {questions.map((question, index) => (
          <li key={index}>{question.question}</li>
        ))}
      </ol>

      <div className="actions">
        <button type="button" className="button" onClick={onChooseOther}>
          다른 파일 선택
        </button>
        <button type="button" className="button primary" onClick={onStart}>
          풀이 시작
        </button>
      </div>
    </section>
  );
}
