import type { PaperSummary } from "@/lib/quiz/types";

type Props = {
  /** 아직 불러오는 중이면 null */
  papers: PaperSummary[] | null;
  error: string | null;
  busy: boolean;
  onSelect: (paper: PaperSummary) => void;
  onReload: () => void;
};

export default function PaperListScreen({ papers, error, busy, onSelect, onReload }: Props) {
  return (
    <section className="card">
      <h1>문제풀이</h1>
      {error && (
        <div className="notice notice-wrong" role="alert">
          <p>{error}</p>
          <button type="button" className="button small" onClick={onReload}>
            다시 불러오기
          </button>
        </div>
      )}
      {papers === null ? (
        !error && <p className="lead">문제지를 불러오고 있습니다…</p>
      ) : papers.length === 0 ? (
        <p className="lead">아직 준비된 문제지가 없습니다. 선생님께 문의해 주세요.</p>
      ) : (
        <>
          <p className="lead">풀고 싶은 문제지를 선택해 주세요.</p>
          <p className="hint">한 문제씩 풀고, 마지막 문항까지 답한 뒤 한 번에 채점합니다.</p>
          <ul className="paper-list">
            {papers.map((paper) => (
              <li key={paper.id}>
                <button type="button" className="paper-button" onClick={() => onSelect(paper)} disabled={busy}>
                  {paper.title}
                  <span className="button-note">{paper.questionCount}문항</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
