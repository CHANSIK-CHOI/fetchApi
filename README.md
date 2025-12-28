# React CRUD Project

## 프로젝트 링크

[https://chansik-choi.github.io/fetchApi/](https://chansik-choi.github.io/fetchApi/) 에서 배포된 결과물을 확인할 수 있습니다.

## Intro

이 프로젝트는 React와 TypeScript를 활용한 사용자 관리 대시보드입니다.
현재 버전은 fetch와 useState 기반의 CRUD 구현에 집중한 단계이며,
[reqres.in](https://reqres.in/) Mock API를 활용하여 데이터를 관리합니다.
리팩토링 관련 상세 설명은 추후 업데이트 예정입니다.

## 주요 기능

1. 조회 (Read) : 사용자 목록 조회 및 로딩/에러 UI 처리
2. 생성 (Create) : 신규 사용자 추가 (Form 상태의 지역화 및 유효성 검사)
3. 수정 (Update) :

- 개별 수정 : 특정 사용자의 정보 수정
- 일괄 수정 : 여러 사용자의 정보를 동시에 수정

4. 삭제 (Delete) :

- 개별 삭제 : 특정 사용자 삭제
- 일괄 삭제 : 체크박스를 통한 다중 선택 및 삭제

## 기술 스택

- Core: React, TypeScript, Vite
- Styling: SCSS (Sass)
- Linting: ESLint, Prettier

## 실행 방법

```bash
npm install
npm run dev
# 브라우저에서 http://localhost:5173 접속
```

## 프로젝트 폴더 구조

프로젝트 폴더 구조는 다음과 같다. (주요 파일만 발췌)

```
src/
├── api/
│   └── users.api.ts          # Fetch API 호출 함수 분리
├── assets/
├── features/
│   └── users/
│       ├── components/
│       │   ├── Users.tsx             # 메인 컨테이너
│       │   ├── UsersControler.tsx    # 전체 선택/삭제 제어바
│       │   ├── UsersList.tsx         # 사용자 목록
│       │   ├── UsersItem.tsx         # 개별 사용자
│       │   ├── UsersNewForm.tsx      # 신규 생성 폼
│       │   └── ...
│       ├── containers/
│       │   └── UsersContainer.tsx    # 데이터 Fetching 및 전역 에러 핸들링
│       ├── context/
│       │   ├── UsersProvider.tsx     # Context Provider
│       │   └── useUsers.ts
│       └── index.ts
├── hooks/
│   └── useUsersQuery.ts      # API 요청 및 데이터 관리 훅
├── reducers/                 # UI 상태 관리 리듀서
│   └── usersReducer.ts
├── style/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

## 기술 블로그 (작업 기록)

프로젝트를 진행하며 마주친 문제와 해결 과정을 기술 블로그에 기록했습니다.

- [시리즈](https://velog.io/@ckstlr0828/series/%EC%8B%A4%EC%8A%B5)
- [GET : 초기 데이터 불러오기](https://velog.io/@ckstlr0828/CRUD1)
- [POST : 데이터 추가하기](https://velog.io/@ckstlr0828/CRUD2)
- [PATCH : 데이터 수정하기](https://velog.io/@ckstlr0828/CRUD3)
- [DELETE : 데이터 삭제하기](https://velog.io/@ckstlr0828/CRUD4)
- [Refactoring : 문제 분석과 해결 전략](https://velog.io/@ckstlr0828/fetchrefactoring1)
- [Refactoring : POST](https://velog.io/@ckstlr0828/fetchrefactoring2)
- [Refactoring : PATCH](https://velog.io/@ckstlr0828/fetchrefactoring3)
- [Refactoring : DELETE](https://velog.io/@ckstlr0828/fetchrefactoring4)
- [Refactoring : React Hook Form](https://velog.io/@ckstlr0828/fetchrefactoring5)
