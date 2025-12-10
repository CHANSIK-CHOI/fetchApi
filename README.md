# fetch 실습 (CRUD)

## 프로젝트 링크
[https://chansik-choi.github.io/fetchApi/](https://chansik-choi.github.io/fetchApi/) 에서 산출물 확인 가능하다.

## Intro

이 프로젝트는 지금까지 배운 자바스크립트 fetch와 타입스크립트를 실제로 사용해 보기 위해 만든 작은 CRUD 예제다.
[reqres.in](https://reqres.in/)를 활용하여 데이터를 불러오고, 추가하고, 수정하고, 삭제하는 기본적인 흐름을 직접 구현했다.

## 주요 기능

- 초기 로딩 시 사용자 목록 조회, 로딩/에러 상태 표시
- 신규 사용자 생성, 기존 사용자 단건 수정/일괄 수정
- 사용자 단건 삭제, 선택 사용자 일괄 삭제
- API 에러 메시지 노출 및 낙관적 업데이트에 가까운 UI 반영 (reqres.in는 mock API라 실제 DB에 반영되지 않음으로 클라이언트 상태를 업데이트 함)

## 기술 스택

- React + TypeScript + Vite
- Sass로 간단한 스타일 구성
- ESLint/Prettier로 코드 품질 및 포맷 관리

## 실행 방법

```bash
npm install
npm run dev
# 브라우저에서 http://localhost:5173 접속
```

## 프로젝트 폴더 구조

프로젝트 폴더 구조는 다음과 같다. (주요 파일만 발췌)

```
.
├── src/
│   ├── api/
│   │   └── users.api.ts
│   ├── assets/
│   ├── features/users
│   │   ├── components/
│   │   │   ├── Users.tsx
│   │   │   └── UsersItem.tsx
│   │   ├── containers/
│   │   │   └── UsersContainer.tsx
│   │   ├── context/
│   │   │   ├── UsersProvider.tsx
│   │   │   └── useUsers.ts
│   │   └── index.tsx
│   ├── hooks/
│   │   └── useUsersQuery.ts
│   ├── style/
│   ├── types/
│   │   └── users.ts
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
└── index.html
```

## 설계 포인트

- `src/api/users.api.ts`에서 fetch 호출을 분리해 타입 안전성을 확보하고, 테스트/교체가 용이하도록 함.
- `useUsersQuery` 훅에서 로딩/에러 상태와 CRUD 함수를 관리해 컨테이너가 데이터 흐름을 단순하게 소비할 수 있도록 구성.
- `UsersProvider` Context로 CRUD 핸들러와 데이터를 하위 컴포넌트에 전달해 prop drilling을 최소화.
- 응답 필드가 일부 비어 있을 때를 대비해 타입 정의(`types/users.ts`)와 기본값 처리를 함께 고려.

## 기술 블로그

프로젝트를 작업하면서 단계별로 내 기술블로그에 작업 과정을 기술하였다.

- [시리즈](https://velog.io/@ckstlr0828/series/%EC%8B%A4%EC%8A%B5)
- [GET : 초기 데이터 불러오기](https://velog.io/@ckstlr0828/CRUD1)
- [POST : 데이터 추가하기](https://velog.io/@ckstlr0828/CRUD2)
- [PATCH : 데이터 수정하기](https://velog.io/@ckstlr0828/CRUD3)
- [DELETE : 데이터 삭제하기](https://velog.io/@ckstlr0828/CRUD4)

## Git Branch

UI제작부터 CRUD단계별로 깃 브랜치를 나눠 작업했다.
최종 리펙토링은 main 브랜치에서 작업하여 최종 산출물은 main 에서 확인하면 되겠다.

## 다음 단계는...

다음 단계에서는, 기본 fetch 기반 구현보다 상태 관리와 서버 상태 동기화에 특화된
@tanstack/react-query의 useQuery와 useMutation을 학습한 뒤,
지금까지 만든 로직을 React Query 기반으로 리팩터링해 볼 계획이다.
