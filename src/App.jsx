import { useState } from "react"
import reactLogo from "./assets/react.svg"
import Header from "./modules/Header"
import Board from "./modules/Board"

import "./App.css"

function App() {
  const [turns, setTurns] = useState([])

  return (
    <main className="mx-auto w-full max-w-xl rounded bg-slate-800 p-2">
      <Header logo={reactLogo} />
      <Board />
    </main>
  )
}

export default App
