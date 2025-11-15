import { useEffect } from 'react'

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
        <h1>Title</h1>
        <p>Sub Text</p>
      </div>
    </main>
  )
}

export default App
