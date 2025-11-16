import { useEffect } from 'react'
import { Users, UsersProvider } from '@/components/Users'

function App() {
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch('https://reqres.in/api/users', {
          headers: {
            'x-api-key': 'reqres-free-v1',
          },
        })
        const json = await res.json()
        console.log(json, res)
      } catch (err) {
        console.log(err)
      }
    }

    void fetchTest()
  }, [])
  return (
    <main>
      <div className="layout-center">
        <h1>Fetch API 실습</h1>
        <p>지금까지 배운 JavaScript & TypeScript를 활용하여 fetch API로 CRUD를 구현해보자.</p>

        <UsersProvider>
          <Users>
            <Users.Item
              profileSrc={undefined}
              firstName="ChanChan"
              lastName="Choi"
              email="chanchan@gmail.com"
              id={1}
            />
            <Users.Item
              profileSrc={undefined}
              firstName="ChanChan"
              lastName="Choi"
              email="chanchan@gmail.com"
              id={2}
            />
          </Users>
        </UsersProvider>
      </div>
    </main>
  )
}

export default App
