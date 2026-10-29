import type { QuestionPaper } from "@/lib/quiz/types";

type Props = {
  papers: QuestionPaper[];
  onSelect: (paper: QuestionPaper) => void;
};

export default function PaperListScreen({ papers, onSelect }: Props) {
  return (
    <section className="card">
      <h1>문제풀이</h1>
      {papers.length === 0 ? (
        <p className="lead">아직 준비된 문제지가 없습니다. 선생님께 문의해 주세요.</p>
      ) : (
        <>
          <p className="lead">풀고 싶은 문제지를 선택해 주세요.</p>
          <p className="hint">한 문제씩 풀고, 마지막 문항까지 답한 뒤 한 번에 채점합니다.</p>
          <ul className="paper-list">
            {papers.map((paper) => (
              <li key={paper.id}>
                <button type="button" className="paper-button" onClick={() => onSelect(paper)}>
                  {paper.title}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
