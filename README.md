# React CRUD & Refactoring Project

## 프로젝트 링크

[https://chansik-choi.github.io/fetchApi/](https://chansik-choi.github.io/fetchApi/) 에서 배포된 결과물을 확인할 수 있습니다.

## Intro

이 프로젝트는 React와 TypeScript를 활용한 사용자 관리 대시보드입니다.
초기에는 기본적인 fetch와 useState를 이용한 CRUD로 시작했으나, 기능이 고도화됨에 따라 발생하는 상태 관리의 복잡성과 렌더링 성능 문제를 해결하기 위해 대규모 리팩토링을 거쳤습니다.
[reqres.in](https://reqres.in/) Mock API를 활용하여 데이터를 관리하며, 단순한 기능 구현을 넘어 **"지속 가능한 코드 구조"**와 **"렌더링 최적화"**에 집중한 프로젝트입니다.


## 주요 기능

1. 조회 (Read) : 사용자 목록 조회 및 스켈레톤/에러 UI 처리
2. 생성 (Create) : 신규 사용자 추가 (Form 상태의 지역화 및 유효성 검사)
3. 수정 (Update) :
  - 개별 수정 : 특정 사용자의 정보 수정
  - 일괄 수정 : 여러 사용자의 정보를 동시에 수정 (Dirty Checking 적용)
4. 삭제 (Delete) :
  - 개별 삭제 : 특정 사용자 삭제
  - 일괄 삭제 : 체크박스를 통한 다중 선택 및 삭제
5. 최적화 :
  - 불필요한 리렌더링 방지 (React.memo, Context 분리)
  - 복잡한 UI 상태 제어 (useReducer)

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
│       │   ├── UsersControler.tsx    # 전체 선택/삭제 제어바 (NEW)
│       │   ├── UsersList.tsx         # 사용자 목록 (Memoized)
│       │   ├── UsersItem.tsx         # 개별 사용자 (Memoized)
│       │   ├── UsersNewForm.tsx      # 신규 생성 폼
│       │   └── ...
│       ├── containers/
│       │   └── UsersContainer.tsx    # 데이터 Fetching 및 전역 에러 핸들링
│       ├── context/
│       │   ├── UsersProvider.tsx     # State와 Action Context 분리
│       │   └── useUsers.ts
│       └── index.ts
├── hooks/
│   └── useUsersQuery.ts      # 서버 데이터(Server State) 관리 훅
├── reducers/                 # UI 상태(Client State) 관리 리듀서 (NEW)
│   └── usersReducer.ts
├── style/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

## 설계 및 리팩토링 포인트
이 프로젝트는 초기 구현 이후 다음과 같은 문제를 해결하기 위해 리팩토링되었습니다.

1. 상태 관리의 분리 (Client State vs Server State)
- Before: `UsersProvider` 하나에서 API 데이터와 UI 상태(모달 열림, 체크박스 등)를 모두 관리하여 God Object가 되는 문제가 있었습니다.
- After:
  - Server State: `useUsersQuery` 커스텀 훅으로 분리하여 데이터 페칭과 동기화 로직을 담당합니다.
  - Client State: 복잡한 UI 제어 로직(수정 모드, 삭제 체크 등)은 `src/reducers/usersReducer.ts`로 분리하여 `useReducer`로 관리합니다.
 
2. 렌더링 성능 최적화
- Context Split: `UsersStateContext`와 `UsersActionsContext`를 분리하여, 상태가 변할 때 불필요하게 `Action`을 사용하는 컴포넌트까지 리렌더링되는 것을 방지했습니다.
- State Colocation: 전역에서 관리하던 Form 입력 상태를 `UsersNewForm`, `UsersItem` 내부의 로컬 상태로 내려, 타이핑 시 전체 앱이 리렌더링되는 문제를 해결했습니다.
- React.memo: 리스트 아이템 등 순수 컴포넌트에 메모이제이션을 적용했습니다.

3. 선언적 프로그래밍과 Derived State
- Key Reset: 복잡한 `useEffect`를 사용해 상태를 초기화하는 대신, React의 `key` props를 변경하여 컴포넌트 상태를 선언적으로 리셋하는 패턴을 적용했습니다.
- Derived State: `isAllChecked`와 같은 중복 상태를 제거하고, 렌더링 시점에 계산하여 상태 동기화 버그를 원천 차단했습니다.

## 기술 블로그 (작업 기록)

프로젝트를 진행하며 마주친 문제와 해결 과정을 기술 블로그에 기록했습니다.

- [시리즈](https://velog.io/@ckstlr0828/series/%EC%8B%A4%EC%8A%B5)
- [GET : 초기 데이터 불러오기](https://velog.io/@ckstlr0828/CRUD1)
- [POST : 데이터 추가하기](https://velog.io/@ckstlr0828/CRUD2)
- [PATCH : 데이터 수정하기](https://velog.io/@ckstlr0828/CRUD3)
- [DELETE : 데이터 삭제하기](https://velog.io/@ckstlr0828/CRUD4)
- [[Refactoring] React CRUD 상태 관리 리팩토링 (1) - 문제 분석과 해결 전략](https://velog.io/@ckstlr0828/fetchrefactoring1)
- [[Refactoring] React CRUD 상태 관리 리팩토링 (2) - POST](https://velog.io/@ckstlr0828/fetchrefactoring2)
- [[Refactoring] React CRUD 상태 관리 리팩토링 (3) - PATCH](https://velog.io/@ckstlr0828/fetchrefactoring3)
- [[Refactoring] React CRUD 상태 관리 리팩토링 (4) - DELETE](https://velog.io/@ckstlr0828/fetchrefactoring4)

## Git Branch 전략
기능 단위로 브랜치를 나누어 작업했으며, 각 기능의 구현과 리팩토링 과정이 커밋에 담겨있습니다.

- main : 최종 리팩토링이 완료된 산출물
- feature/리펙토링_POST
- feature/리펙토링_PATCH
- feature/리펙토링_DELETE
