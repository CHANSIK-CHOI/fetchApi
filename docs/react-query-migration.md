# fetch API 기반 구현 vs React Query 도입 리팩터링 비교

이 글은 기존 `fetch + useState + useEffect` 기반 CRUD 코드에서 `@tanstack/react-query`(이하 React Query)로 전환한 과정을 정리합니다. React Query를 처음 접하는 분들을 대상으로, 어떤 문제가 있었고 어떻게 개선되었는지 상세히 설명합니다.

## 기존 구현: 직접 상태·요청 관리

- **데이터 로딩**: `useEffect`로 `getAllUsersApi`를 호출하고, `useState`로 `users`, `isLoading`, `error`를 관리.
- **캐싱 부재**: 화면을 다시 열거나 동일 데이터를 다시 요청할 때 매번 네트워크 요청 발생.
- **동시성 관리 어려움**: 요청이 겹칠 때 최신 응답을 보장하기 위해 수동 방어 로직 필요.
- **상태 분산**: CRUD마다 별도 `useCallback`과 `setState`를 사용해 코드가 길고 분기 많음.
- **에러 처리 중복**: 각 요청마다 try/catch와 에러 메시지 세팅을 반복.

### 기존 코드 스케치

```ts
const [users, setUsers] = useState<User[]>([])
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState('')

useEffect(() => {
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const { data } = await getAllUsersApi()
      setUsers(data)
    } catch (err) {
      setError('유저 데이터를 받아올 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }
  void fetchUsers()
}, [])

// 추가/수정/삭제도 각각 setState로 직접 업데이트
```

## 리팩터링 목표

1. **데이터 패칭 표준화**: 로딩/에러/데이터 상태를 일관되게 다루기.
2. **캐싱 & 자동 재검증**: 동일 요청의 중복 호출을 줄이고, 필요 시 재요청 쉽게 하기.
3. **코드 단순화**: 중복된 에러 처리, 상태 플래그 관리, 수동 캐시 갱신을 최소화.
4. **비동기 흐름 가시성**: 쿼리/뮤테이션 별로 상태를 명확히 노출.

## React Query 도입 후 구조

- **프로바이더 추가**: `src/main.tsx`에서 `QueryClientProvider`로 앱을 감싸 전역 쿼리 클라이언트를 제공.
- **쿼리 훅**: `useQuery`로 목록 조회(`USERS_QUERY_KEY`), `useMutation`으로 생성/수정/삭제 처리.
- **캐시 갱신**: `queryClient.setQueryData`로 성공 시 캐시를 즉시 반영. 재요청 없이 UI가 최신 상태를 보여줌.
- **에러 관리**: 훅 내부에서 에러 문자열을 단일 상태로 관리해 컴포넌트는 `error`만 구독.

### 핵심 코드 조각

```ts
const USERS_QUERY_KEY = ['users']

const usersQuery = useQuery<User[], Error>({
  queryKey: USERS_QUERY_KEY,
  queryFn: async () => (await getAllUsersApi()).data,
})

const createUserMutation = useMutation({
  mutationFn: postUserApi,
  onSuccess: (result) => {
    const newUser =
      /* 서버 응답을 UI 모델로 변환 */
      queryClient.setQueryData<User[]>(USERS_QUERY_KEY, (prev = []) => [newUser, ...prev])
  },
})
```

## 비교: 무엇이 나아졌나?

- **로딩/에러 상태 자동화**
  - Before: 매 요청마다 `isLoading` 토글, `setError` 호출 필요.
  - After: `useQuery`가 `isPending/isFetching/error`를 제공. 뮤테이션도 `isPending`, `isError` 등 상태 플래그를 자동 제공.

- **데이터 캐싱 및 공유**
  - Before: 동일 목록을 다른 컴포넌트가 쓰려면 별도 상태 전달이나 재요청 필요.
  - After: `queryKey` 기반 캐시에 저장되어 어디서든 동일 키로 즉시 재사용.

- **수동 리프레시/무효화 용이**
  - `queryClient.invalidateQueries(USERS_QUERY_KEY)` 한 줄로 재검증 가능(이번 구현은 성공 시 수동 `setQueryData`로 즉시 반영).

- **코드 간결성**
  - try/catch, 로딩 토글, 에러 세팅이 크게 줄어 비즈니스 로직 집중도가 높아짐.

- **동시성 안전성**
  - 동일 키 중복 호출 시 React Query가 최신성 관리. `staleTime` 등 옵션으로 네트워크/캐시 균형 조정 가능.

## 디테일: 이번 리팩터링 포인트

1. **QueryClientProvider**: `main.tsx`에 전역 클라이언트를 생성해 모든 하위 컴포넌트에서 쿼리 사용 가능.
2. **데이터 읽기**: `useQuery`로 목록을 가져오고, `usersQuery.data ?? []`로 안전히 소비.
3. **생성/수정/삭제**: 각 뮤테이션 성공 시 `setQueryData`로 캐시를 직접 업데이트해 즉시 UI 반영(optimistic update와 유사한 효과).
4. **에러 메시지**: 훅 내부 `error` 상태 하나로 통일, UI는 문자열만 표시하도록 단순화.
5. **로딩 상태**: `isPending || isFetching`을 묶어 `isLoading`으로 노출해 기존 UI 표기와 호환.
6. **초기 데이터**: `initialData`/`placeholderData`로 첫 렌더 데이터를 지정해 SSR·프리패치·스켈레톤 대용으로 활용 가능.

## 도입 시 추가로 고려하면 좋은 옵션

- **staleTime / cacheTime**: 신선도 기준을 조정해 네트워크 호출 빈도와 응답 속도를 최적화.
- **retry**: 네트워크 오류 시 자동 재시도 횟수/딜레이 설정.
- **select**: 응답을 훅 내부에서 가공해 컴포넌트로 넘길 때 데이터 형태를 단순화.
- **optimistic updates**: 삭제/수정 시 낙관적 업데이트를 적용하고 실패 시 롤백 처리.
– **initialData / placeholderData**: 서버에서 미리 가져온 값이나 기본값을 넣어 첫 렌더를 채우고, 사용자에게 빈 화면 대신 즉시 데이터를 보여줌.

## 마이그레이션 가이드 요약

1. `npm install @tanstack/react-query` 후 `QueryClientProvider` 추가.
2. 기존 `useEffect + fetch` 로직을 `useQuery`로 교체하고 `queryKey`를 정한다.
3. POST/PATCH/DELETE는 `useMutation`을 사용하고, 성공 시 `setQueryData` 또는 `invalidateQueries`로 캐시를 갱신한다.
4. 컴포넌트에서는 `isPending/isFetching/error/data` 등 React Query가 제공하는 상태만으로 UI를 구성한다.
5. 필요하면 `staleTime`, `retry`, `select` 등 옵션으로 사용자 경험을 조정한다.

## 마무리

React Query를 도입함으로써 네트워크 상태 관리, 캐싱, 에러/로딩 처리의 표준화가 이루어졌고, UI와 비즈니스 로직에 집중하기 쉬워졌습니다. fetch로 직접 상태를 관리할 때 겪던 중복 코드와 동시성 문제를 크게 줄였으니, 다른 API 도메인에도 같은 패턴을 적용해 볼 수 있습니다.
