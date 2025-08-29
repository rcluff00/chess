import { useState } from "react"
import reactLogo from "./assets/react.svg"
import Header from "./modules/Header"
import Board from "./modules/Board"
import { INITIAL_BOARD } from "./utils/InitalBoard"
import { getAllowedMoves } from "./utils/AllowedMoves"

import "./App.css"

function App() {
  const [turns, setTurns] = useState([])
  const [board, setBoard] = useState(INITIAL_BOARD)
  const [selectedCoord, setSelectedCoord] = useState(null)

  const whoseTurn = getWhoseTurn(turns)
  const allowedMoves = selectedCoord
    ? getAllowedMoves(selectedCoord, board)
    : []

  function movePiece(prevCoord, targetCoord) {
    const piece = board[prevCoord.row][prevCoord.col]
    board[prevCoord.row][prevCoord.col] = null // remove piece
    board[targetCoord.row][targetCoord.col] = piece // replace piece

    setBoard(board)
    setSelectedCoord(null)
  }

  function getWhoseTurn(turns) {
    return turns.length % 2
  }

  function handleSquareClick(coord) {
    const { row, col } = coord
    const targetPiece = board[coord.row][coord.col]
    const selectedPiece = selectedCoord
      ? board[selectedCoord.row][selectedCoord.col]
      : null

    // deselect same square
    if (
      selectedCoord &&
      row === selectedCoord.row &&
      col === selectedCoord.col
    ) {
      setSelectedCoord(null)
    }

    // move selected piece to valid square
    else if (
      selectedPiece &&
      allowedMoves &&
      allowedMoves.some((m) => m.row === row && m.col === col)
    ) {
      movePiece(selectedCoord, coord)
      setTurns((prevTurns) => {
        const updatedTurns = [board, ...prevTurns]
        return updatedTurns
      })
    }

    // select new piece
    else if (targetPiece && targetPiece.player === whoseTurn) {
      setSelectedCoord(coord)
    }

    // else if()
  }

  return (
    <main className="mx-auto w-full max-w-xl rounded bg-slate-800 p-2">
      <Header logo={reactLogo} />
      <Board
        board={board}
        onSquareClick={handleSquareClick}
        allowedMoves={allowedMoves}
        selectedCoord={selectedCoord}
      />
    </main>
  )
}

export default App
