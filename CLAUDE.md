# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

교사가 JSON 문제지를 올려 Firestore에 저장·공개하면, 학생이 이름만 입력하고 공개된 문제지를 골라 4지선다 문제를 끝까지 푼 뒤 한 번에 채점해 점수·문항별 정오·해설을 보는 교육용 웹앱입니다. 최종 결과는 Firestore에 저장되고 교사가 결과표·평균을 봅니다. Next.js + TypeScript로 만들고 Vercel에 배포하며, PC와 휴대폰 모두에서 쓸 수 있어야 합니다.

- **버전 구분:** 학생 업로드(초기) → 폴더 목록 → 역할 분리 → 현재 Firestore 버전입니다. `question-papers/` 폴더의 문제지는 더 이상 학생 목록에 나오지 않고 업로드 예시 파일로만 남습니다(PRD.md의 "버전 기록").

- **요구사항의 기준은 [PRD.md](PRD.md)입니다.** 파일 형식, 검증 규칙, 화면 흐름, 점수 계산, 결과 화면 구성은 모두 PRD.md의 "세부 결정 사항"까지 포함해 따릅니다.
- **1일차와 2일차 범위를 구분합니다.** 1일차에는 로그인·AI 문제 생성·DB 저장을 구현하지 않습니다. 2일차 기능(Google 로그인, Azure AI 문제 생성, Firestore 저장, 교사용 조회)은 나중에 붙일 수 있게 구조만 열어 두고, 미리 만들지 않습니다.
- 풀이 중에는 정답 여부·점수·해설을 보여주지 않습니다. 현재 버전은 서버가 풀이 중인 학생에게 문제·보기만 보내고(정답·해설 제외), 최종 제출 때 서버가 채점·저장한 뒤에 결과를 돌려줍니다.

## 현재 상태

- 1일차 앱(현재 버전: 문제지 목록 방식)을 만들었고 Vercel에 배포했습니다(2026-10-30). 다시 배포하는 것은 사용자가 요청할 때만 합니다.
  - 정식 주소: https://claude-day1-quiz-puce.vercel.app (로그인 없이 열림)
  - Vercel 계정 `yslee5208-8630`, 팀 `yeon-2769`(무료 Hobby), 프로젝트 `claude-day1-quiz`. 이 폴더는 `vercel link`로 연결되어 있습니다(`.vercel`, `.env.local`은 Git에서 제외됨).
  - 다시 배포: `vercel deploy --prod --yes`. GitHub 연결이 없어 push해도 자동 배포되지 않습니다.
  - 컴퓨터 이름이 한글("노트북95")이라 Vercel CLI의 `login` 등이 `ByteString` 오류로 실패합니다. 이때는 `os.hostname()`을 영문 이름으로 바꾸는 작은 `.mjs` 파일을 `NODE_OPTIONS='--import file:///...'`로 그 명령에만 적용해 실행합니다.
- 2일차: 교사/학생 선택, 학생 이름 입장, 교사 Google 로그인, Firestore 문제지 등록·공개·결과 저장·결과표를 추가했습니다(로컬 확인만, 아직 배포하지 않음. 배포된 Vercel 사이트는 1일차 모습). Azure AI 문제 생성은 아직 없습니다.
- Firebase 프로젝트 `claude-day1-quiz-yslee`(표시 이름 claude-day1-quiz, 무료 Spark), 웹 앱 `quiz-web`(App ID `1:237614242596:web:207549c51538c5ceeb31b1`). 이 컴퓨터의 Firebase CLI는 yslee5208@gmail.com으로 로그인되어 있습니다. 교사 허용 계정도 yslee5208@gmail.com입니다.
  - Authentication: Google 로그인 사용 설정됨. 승인된 도메인: `localhost`, 기본 Firebase 도메인 2개, `claude-day1-quiz-puce.vercel.app`.
  - Firestore: `(default)` DB, 서울(`asia-northeast3`), Native 모드. 규칙(`firestore.rules`)은 브라우저의 직접 읽기·쓰기를 모두 거부합니다. 바꾼 뒤 `firebase deploy --only firestore:rules`로 적용합니다(`firebase.json`, `.firebaserc`).
  - 서버 계정 `quiz-app-server@claude-day1-quiz-yslee.iam.gserviceaccount.com`(권한: `roles/datastore.user`만). 키는 `.env.local`의 `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`에만 있습니다. 키를 출력하거나 커밋하지 않습니다.
  - 콘솔 설정(승인된 도메인, API 켜기, 서비스 계정 등)은 Firebase CLI의 로그인 정보(`~/.config/configstore/firebase-tools.json`의 refresh token + firebase-tools의 공개 client id)로 Google 관리 API를 호출해 바꿀 수 있습니다. 사용자가 브라우저를 직접 조작하지 않게 이 방법을 먼저 씁니다.
- Git 저장소(`main` 갈래)입니다. 원격 저장소 `origin`은 GitHub 비공개 저장소 https://github.com/YeonSu-Lee/claude-day1-quiz 입니다. 이 저장소와 Vercel은 연결되어 있지 않습니다.
- 예시 문제지는 `question-papers/high-school-questions.json`("고등학교 정보과목", 10문항)과 `question-papers/sample-questions.json`("중학교 정보과목", 10문항) 두 개입니다(교사가 올려 볼 예시. 앱은 이 폴더를 읽지 않음). `papers.test.ts`가 이 파일들이 올바른 형식인지 확인하므로, 파일을 추가·삭제하면 그 테스트도 함께 고칩니다. 문제지 파일의 문제·보기·정답·해설은 사용자 요청 없이 바꾸지 않고, 확인용 문제지를 이 폴더에 임의로 추가하지 않습니다(여러 문제지 동작은 `papers.test.ts`가 OS 임시 폴더에서 확인합니다).

## 명령

PowerShell에서는 `npm` 대신 `npm.cmd`를 씁니다.

```
npm.cmd run dev      # 개발 서버 (http://localhost:3000)
npm.cmd test         # lib/**/*.test.ts – Node 내장 테스트, TS를 그대로 실행
npm.cmd run lint
npm.cmd run build
node --test lib/quiz/score.test.ts   # 테스트 파일 하나만 실행
```

- 미리보기 브라우저용 설정은 `.claude/launch.json`(이름: `quiz-app`)에 있습니다.

## 구조

- 주소별 화면: `app/page.tsx`(`/`, 교사/학생 선택), `app/teacher/page.tsx`(`/teacher`, `components/TeacherScreen.tsx`), `app/student/page.tsx`(`/student`).
- 교사 로그인: `TeacherScreen`이 Firebase Auth(Google, 팝업)로 로그인한 뒤 ID 토큰을 `GET /api/teacher/me`(`app/api/teacher/me/route.ts`)에 보내고, 서버가 허용해야 내용을 보여줍니다.
  - 서버 확인은 `lib/auth/teacher.ts`의 `verifyTeacherRequest()`입니다. `jose`로 Google 공개키를 써서 토큰을 검증합니다. 모든 `/api/teacher/**`는 이 함수를 먼저 거칩니다.
  - 브라우저용 Firebase 연결은 `lib/firebase/client.ts`, 서버용 Firestore 연결은 `lib/firebase/admin.ts`(firebase-admin, 서버 계정 키)입니다. admin 쪽은 브라우저 코드에서 불러오지 않습니다.
  - 설정: `.env`(Git 제외) = `NEXT_PUBLIC_FIREBASE_*`(공개 웹 설정), `TEACHER_EMAIL`. `.env.local`(Git 제외) = 서버 계정 키, Vercel OIDC 토큰. Vercel에 배포할 때는 앞의 값을 Vercel 환경변수에도 넣어야 합니다.
- 서버 API(`app/api/`): Firestore 읽기·쓰기는 모두 `lib/store/firestore.ts`를 거칩니다.
  - 학생용(로그인 없음): `GET /api/papers`(공개 목록), `GET /api/papers/[id]`(문제·보기만, `toPublicQuestions`), `POST /api/papers/[id]/submissions`(서버 채점 후 `results` 저장, 성공해야 결과 반환)
  - 교사용: `GET|POST /api/teacher/papers`(목록·등록, 서버에서 `parseQuizFile` 재검사, 제목/내용 중복 409), `PATCH /api/teacher/papers/[id]`(공개 전환), `GET /api/teacher/papers/[id]/results`(결과표·평균)
  - Firestore: `papers/{자동 id}`(정답 포함 원본, `published`, `titleKey`, `contentHash`), `results/{paperId}_{이름 해시}`(같은 문제지·같은 이름은 덮어씀). 복합 색인이 필요 없도록 정렬은 서버 메모리에서 합니다.
- 교사 화면: `TeacherScreen`(로그인) → `TeacherDashboard`(파일 선택·미리보기·저장, 공개 전환, 결과표).
- 학생 화면: `StudentApp`(이름 입력 `StudentNameScreen`) → `QuizApp`이 목록·문제를 서버에서 받고, 단계 상태(`list → solving → result`)와 답을 React 상태로만 가집니다. 제출 실패 시 답을 유지하고 다시 제출하게 합니다.
- 나머지 화면(`PaperListScreen`, `QuizScreen`, `ResultScreen`)은 props와 콜백만 받습니다.
- `lib/quiz/`는 화면과 분리된 로직입니다. 2일차 기능도 같은 `Question`/`QuestionPaper` 타입을 쓰도록 이어 붙입니다.
  - `parse.ts`: 문제지 한 파일(title + questions)을 검증하고 한국어 오류 문구를 만듭니다. 하나라도 틀리면 파일 전체를 거부합니다.
  - `papers.ts`: 폴더의 `*.json`을 읽습니다. 지금은 앱에서 쓰지 않고, 예시 파일 형식 확인 테스트에만 쓰입니다.
    - fs 호출에 붙은 `/*turbopackIgnore: true*/`는 빌드 경고(프로젝트 전체 추적)를 막기 위한 것이므로 지우지 않습니다.
  - `score.ts`: 채점을 담당합니다. 점수는 소수 첫째 자리에서 반올림합니다.
  - `publish.ts`: 학생용 문항(정답·해설 제거), 제목·내용 중복 비교값(서버 전용, `node:crypto`).
- `lib/results/`: `name.ts`(학생 이름 정리·길이 제한, 브라우저에서도 씀), `record.ts`(결과 문서, 결과표·평균 계산, 서버 전용).
- `lib/` 안에서 서로 불러올 때는 Node 테스트가 TS를 직접 실행할 수 있도록 지켜야 할 규칙이 있습니다.
  - 값을 불러오면 `.ts` 확장자를 붙입니다(`allowImportingTsExtensions`).
  - 타입은 `import type`으로 불러옵니다.
  - enum처럼 타입 제거만으로 처리할 수 없는 TS 문법은 쓰지 않습니다.
- 스타일은 `app/globals.css` 한 파일에 있습니다(Tailwind 없음).

## 작업 환경

- Windows 11, PowerShell 5.1
- Node.js v26.13.0, npm·npx 11.20.0, Git 2.56.0이 설치되어 있습니다(`C:\Program Files\nodejs`, `C:\Program Files\Git`).
- PowerShell 실행 정책 때문에 `npm`/`npx`가 막히면 `npm.cmd`/`npx.cmd`로 실행합니다.
- 현재 사용자 PowerShell 실행 정책은 RemoteSigned입니다. Vercel CLI 65.8.0과 Firebase CLI 15.34.2는 `C:\Users\user\AppData\Roaming\npm`에 전역 설치되어 있습니다.
- Claude의 PowerShell 도구는 격리된 환경이라, 그 안에서 한 전역 설치나 설정 변경은 실제 컴퓨터에 남지 않습니다. 실제 컴퓨터에 설치하거나 설정을 바꿀 때는 터미널 패널(`run_in_terminal`)을 쓰고, 그 패널에서 결과를 확인합니다.
- Git 사용자 이름·이메일이 실제 컴퓨터의 global 설정에는 없습니다. 커밋할 때 `git -c user.name=YeonSu-Lee -c user.email=yslee5208@gmail.com commit ...`처럼 지정합니다(이전 커밋과 같은 작성자).
- Vercel·GitHub 계정 로그인은 사용자가 직접 합니다. Claude가 비밀번호를 입력하지 않습니다.

## 작업 규칙

사용자는 개발을 모르는 일반인입니다.

### 앱을 만드는 기준

- PRD.md에 적힌 요구사항을 기준으로 작업합니다.
- 지금 만들 기능과 나중에 추가할 기능을 구분합니다.
- 정해진 조건을 마음대로 바꾸거나, 요청하지 않은 기능을 추가하지 않습니다.
- 정해지지 않은 내용이나 선택이 필요한 사항은 먼저 질문합니다.
- 기존 파일의 내용과 PRD.md가 서로 다르면 임의로 결정하지 말고 사용자에게 알립니다.

### 사용자에게 설명하는 방법

- 새 세션을 시작하면 1일차인지 2일차인지 먼저 물어봅니다.
- 모든 설명은 쉬운 한국어로 합니다. 개발 지식이 있어야 이해할 수 있는 기술용어는 쓰지 않습니다.
- 사용자가 알아야 할 것은 "무엇을 하면 되는지"와 "어떤 결과가 나오는지"입니다.
- 화면에 표시된 버튼 이름과 파일 이름은 그대로 알려주되, 설명은 쉬운 말로 합니다.
- 설치나 설정이 필요하면 다음 순서로 안내합니다.
  1. 어느 화면을 열어야 하는지
  2. 무엇을 누르거나 입력해야 하는지
  3. 제대로 됐는지 무엇을 보고 확인하는지
- 사용자가 입력할 내용은 그대로 복사해 쓸 수 있게 제공합니다.
- 여러 가지를 한꺼번에 시키지 않고, 한 단계씩 순서대로 안내합니다.
- 오류가 나면 원인과 해결 방법을 쉬운 말로 설명합니다.

### 작업을 진행하는 방법

- 앱을 만들기 전에 무엇을 어떤 순서로 만들지 짧게 설명하고 사용자의 확인을 받습니다.
- 수정한 뒤에는 무엇이 바뀌었는지, 사용자가 어떻게 확인하면 되는지 알려줍니다.
- 실제로 확인한 결과와 아직 확인하지 못한 부분을 구분해서 말합니다.
- 실행하거나 확인하지 않은 일을 완료했다고 말하지 않습니다.
- 앱 화면의 안내 문구와 오류 메시지도 일반인이 이해할 수 있는 쉬운 말로 씁니다.
