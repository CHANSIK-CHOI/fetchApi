import { UsersContainer } from '@/features/users'

function App() {
  return (
    <main className="page">
      <div className="layout-center">
        <section className="hero">
          <div className="hero__text">
            <span className="hero__eyebrow">React CRUD Practice</span>
            <h1 className="hero__title">Fetch API 실습</h1>
            <p className="hero__subtitle">
              지금까지 배운 JavaScript & TypeScript를 활용해 사용자 데이터를 관리하고 CRUD를
              구현합니다.
            </p>
            <div className="hero__badges">
              <span className="badge">React</span>
              <span className="badge">TypeScript</span>
              <span className="badge">Fetch API</span>
            </div>
          </div>
          <div className="hero__card">
            <span className="hero__cardLabel">Mock API</span>
            <h2 className="hero__cardTitle">User Dashboard</h2>
            <p className="hero__cardText">데이터 조회부터 생성, 수정, 삭제까지 한 화면에서 관리.</p>
            <div className="hero__cardMeta">
              <span>CRUD</span>
              <span>Validation</span>
              <span>Batch Edit</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <h2 className="panel__title">Users</h2>
              <p className="panel__subtitle">목록을 확인하고 필요한 작업을 수행하세요.</p>
            </div>
            <div className="panel__hint">상단 액션에서 생성, 전체 수정, 삭제를 진행합니다.</div>
          </div>
          <UsersContainer />
        </section>
      </div>
    </main>
  )
}

export default App
