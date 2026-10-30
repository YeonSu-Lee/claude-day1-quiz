import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <section className="card">
        <h1>문제풀이</h1>
        <p className="lead">어떻게 시작할지 골라 주세요.</p>
        <ul className="paper-list">
          <li>
            <Link href="/teacher" className="paper-button">
              교사로 시작하기
              <span className="button-note">문제를 등록하고 학생들의 풀이 결과를 확인합니다.</span>
            </Link>
          </li>
          <li>
            <Link href="/student" className="paper-button">
              학생으로 시작하기
              <span className="button-note">이름을 입력하고 문제를 풉니다.</span>
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
