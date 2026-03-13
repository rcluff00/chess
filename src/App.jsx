import { useState } from "react"
import reactLogo from "./assets/react.svg"
import Header from "./modules/Header"
import Board from "./modules/Board"
import { INITIAL_BOARD } from "./utils/InitalBoard"
import { getAllowedMoves } from "./utils/AllowedMoves"
import CapturedList from "./modules/CapturedList"
import { useEffect } from "react"
import { useRef } from "react"

import "./App.css"

function App() {
  const [turns, setTurns] = useState([])
  const [board, setBoard] = useState(structuredClone(INITIAL_BOARD))
  const [selectedCoord, setSelectedCoord] = useState(null)

  const turnsRef = useRef(turns)
  const boardRef = useRef(board)
  useEffect(() => {
    turnsRef.current = turns
  }, [turns])
  useEffect(() => {
    boardRef.current = board
  }, [board])

  const pieces = getPieces(board)
  const activePlayer = getActivePlayer(turns)
  const allowedMoves = selectedCoord
    ? getAllowedMoves(selectedCoord, board)
    : []

  function getKingCoord(player) {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const piece = board[row][col]
        if (piece) {
          if (piece.type === "k" && piece.player === player) return { row, col }
        }
      }
    }
  }

  function getPieces(board) {
    const initialPieces = INITIAL_BOARD.flat()
      .filter(Boolean)
      .reduce((acc, piece) => {
        if (!acc[piece.player])
          acc[piece.player] = { initial: [], remaining: [], captured: [] }
        acc[piece.player].initial.push(piece)
        return acc
      }, {})

    const remainingPieces = board
      .flat()
      .filter(Boolean)
      .reduce((acc, piece) => {
        if (!acc[piece.player]) acc[piece.player] = []
        acc[piece.player].push(piece)
        return acc
      }, {})

    const result = {}
    for (const player in initialPieces) {
      const initial = initialPieces[player].initial
      const remaining = remainingPieces[player] || []
      const captured = initial.filter(
        (p) => !remaining.some((r) => r.id === p.id),
      )

      result[player] = { remaining, captured }
    }

    return result
  }

  function movePiece(prevCoord, targetCoord) {
    const piece = board[prevCoord.row][prevCoord.col]
    board[prevCoord.row][prevCoord.col] = null // remove piece
    board[targetCoord.row][targetCoord.col] = piece // replace piece
  }

  function getActivePlayer(turns) {
    return turns.length % 2 ? "b" : "w"
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

    // move selected piece
    else if (
      selectedPiece &&
      allowedMoves &&
      allowedMoves.some((m) => m.row === row && m.col === col)
    ) {
      const prevBoard = structuredClone(board)

      movePiece(selectedCoord, coord)
      const kingCoord = getKingCoord(activePlayer)

      // check if move puts own king in check
      if (isSquareInCheck(kingCoord, board)) {
        console.log("panic")
        setBoard(prevBoard)
      } else {
        const newBoard = structuredClone(board) // snapshot after move
        setBoard(newBoard)
        setSelectedCoord(null)
        setTurns((prevTurns) => [newBoard, ...prevTurns]) // store the snapshot
      }
    }

    // select new piece
    else if (targetPiece && targetPiece.player === activePlayer) {
      setSelectedCoord(coord)
    } else {
      setSelectedCoord(null)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault()
        undoMove()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  function undoMove() {
    const currentTurns = turnsRef.current
    if (currentTurns.length < 1) return

    const prevTurns = currentTurns.slice(1) // drop the latest move
    const prevBoard = structuredClone(currentTurns[1] || INITIAL_BOARD) 
    // fallback to initial if no more turns

    setTurns(prevTurns)
    setBoard(prevBoard)
    setSelectedCoord(null)
  }

  function isSquareInCheck(coord, board) {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const piece = board[row][col]
        if (piece) {
          const allowedMoves = getAllowedMoves({ row, col }, board)
          if (
            allowedMoves.some((m) => m.row === coord.row && m.col === coord.col)
          ) {
            return true
          }
        }
      }
    }
    return false
  }

  return (
    <main className="mx-auto w-full max-w-xl rounded bg-slate-500 p-2">
      <Header logo={reactLogo} />
      <CapturedList pieces={pieces.w.captured} />
      <Board
        board={board}
        onSquareClick={handleSquareClick}
        allowedMoves={allowedMoves}
        selectedCoord={selectedCoord}
      />
      <CapturedList pieces={pieces.b.captured} />
    </main>
  )
}

export default App
