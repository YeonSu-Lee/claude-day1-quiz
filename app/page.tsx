import QuizApp from "@/components/QuizApp";
import { loadQuestionPapers } from "@/lib/quiz/papers";

export default function Home() {
  return <QuizApp papers={loadQuestionPapers()} />;
}
