import { useEffect } from 'react'

import { Users } from '@/components'

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

        <section>
          <Users>
            <Users.Item
              profileSrc={undefined}
              firstName="ChanSik"
              lastName="Choi"
              email="ccsik0828@gmail.com"
            />
          </Users>
        </section>
      </div>
    </main>
  )
}

export default App
