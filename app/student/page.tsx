import StudentApp from "@/components/StudentApp";

// 공개된 문제지 목록은 학생이 들어온 뒤 서버(/api/papers)에서 받습니다.
export default function StudentPage() {
  return <StudentApp />;
}
