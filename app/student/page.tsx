import StudentApp from "@/components/StudentApp";
import { loadQuestionPapers } from "@/lib/quiz/papers";

export default function StudentPage() {
  return <StudentApp papers={loadQuestionPapers()} />;
}
