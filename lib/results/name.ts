// 학생 이름 규칙. 브라우저와 서버가 함께 씁니다(서버 전용 모듈을 불러오지 않음).

export const MAX_STUDENT_NAME_LENGTH = 30;

/** 화면에 보일 학생 이름. 앞뒤 공백을 지우고 연속 공백은 하나로 줄입니다. */
export function cleanStudentName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}
