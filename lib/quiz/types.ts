/** 문제 파일의 한 문항. correctAnswer는 options의 1부터 시작하는 번호입니다. */
export type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

/** 문항별로 고른 보기 번호(1~4). 아직 고르지 않았으면 null. */
export type Answers = (number | null)[];
