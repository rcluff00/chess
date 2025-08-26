import { useState } from "react";
import reactLogo from "./assets/react.svg";
import Header from "./modules/Header";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="mx-auto max-w-2xl rounded bg-slate-800 p-2">
      <Header logo={reactLogo} />
    </main>
  );
}

export default App;
