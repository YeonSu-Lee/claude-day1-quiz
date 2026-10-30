/** 문제 파일의 한 문항. correctAnswer는 options의 1부터 시작하는 번호입니다. */
export type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

/** 문제지 하나. 폴더에서 읽으면 id는 확장자를 뺀 파일 이름, Firestore에서 읽으면 문서 id입니다. */
export type QuestionPaper = {
  id: string;
  title: string;
  questions: Question[];
};

/** 풀이 중 학생에게 보내는 문항. 정답과 해설은 빠져 있습니다. */
export type PublicQuestion = Pick<Question, "question" | "options">;

/** 풀이 중 학생에게 보내는 문제지. */
export type PublicPaper = {
  id: string;
  title: string;
  questions: PublicQuestion[];
};

/** 학생 화면 문제지 목록의 한 줄. */
export type PaperSummary = {
  id: string;
  title: string;
  questionCount: number;
};

/** 문항별로 고른 보기 번호(1~4). 아직 고르지 않았으면 null. */
export type Answers = (number | null)[];
