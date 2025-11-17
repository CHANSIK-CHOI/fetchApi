import { UsersContainer } from '@/features/users'

function App() {
  return (
    <main>
      <div className="layout-center">
        <h1>Fetch API 실습</h1>
        <p>지금까지 배운 JavaScript & TypeScript를 활용하여 fetch API로 CRUD를 구현해보자.</p>
        <UsersContainer />
      </div>
    </main>
  )
}

export default App
