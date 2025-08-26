import { useState } from 'react'
import reactLogo from './assets/react.svg'
import Header from './modules/Header'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className='max-w-2xl p-2 bg-slate-800 mx-auto rounded'>
      <Header logo={reactLogo} />
    </main>
  )
}

export default App
