import TeacherScreen from "@/components/TeacherScreen";

// 교사 화면입니다. Google 로그인 후 서버(/api/teacher/me)가 허용한 계정에만 내용을 보여줍니다.
// 문제 등록·결과 조회는 다음 단계에서 연결합니다.
export default function TeacherPage() {
  return (
    <main className="container">
      <TeacherScreen />
    </main>
  );
}
