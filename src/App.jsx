import { useState } from "react"
import reactLogo from "./assets/react.svg"
import Header from "./modules/Header"
import Board from "./modules/Board"
import { INITIAL_BOARD } from "./utils/InitalBoard"
import { getAllowedMoves } from "./utils/AllowedMoves"
import { pieceImages } from "./utils/Pieces"
import CapturedList from "./modules/CapturedList"
import { useEffect } from "react"
import { useRef } from "react"

import "./App.css"

function App() {
  const [turns, setTurns] = useState([])
  const [board, setBoard] = useState(structuredClone(INITIAL_BOARD))
  const [selectedCoord, setSelectedCoord] = useState(null)
  const [gameStatus, setGameStatus] = useState(null) // null | "check" | "checkmate" | "stalemate"
  const [pendingPromotion, setPendingPromotion] = useState(null) // { coord, player }

  const turnsRef = useRef(turns)
  useEffect(() => {
    turnsRef.current = turns
  }, [turns])

  const pieces = getPieces(board)
  const activePlayer = getActivePlayer(turns)
  const allowedMoves = selectedCoord
    ? getAllowedMoves(selectedCoord, board).filter((move) => {
        const selectedPiece = board[selectedCoord.row][selectedCoord.col]
        const isCastle = selectedPiece?.type === 'k' && Math.abs(move.col - selectedCoord.col) === 2

        if (isCastle) {
          if (isSquareInCheck(selectedCoord, board)) return false
          const intermediateCol = (selectedCoord.col + move.col) / 2
          const testBoard2 = structuredClone(board)
          testBoard2[selectedCoord.row][intermediateCol] = testBoard2[selectedCoord.row][selectedCoord.col]
          testBoard2[selectedCoord.row][selectedCoord.col] = null
          if (isSquareInCheck({ row: selectedCoord.row, col: intermediateCol }, testBoard2)) return false
        }

        const testBoard = structuredClone(board)
        testBoard[move.row][move.col] = testBoard[selectedCoord.row][selectedCoord.col]
        testBoard[selectedCoord.row][selectedCoord.col] = null
        const kingCoord = getKingCoord(activePlayer, testBoard)
        return !isSquareInCheck(kingCoord, testBoard)
      })
    : []

  function getKingCoord(player, board) {
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
    piece.hasMoved = true
    board[prevCoord.row][prevCoord.col] = null
    board[targetCoord.row][targetCoord.col] = piece
  }

  function getActivePlayer(turns) {
    return turns.length % 2 ? "b" : "w"
  }

  function resetGame() {
    setBoard(structuredClone(INITIAL_BOARD))
    setTurns([])
    setSelectedCoord(null)
    setGameStatus(null)
  }

  function handlePromotion(pieceType) {
    const { coord, player } = pendingPromotion
    board[coord.row][coord.col] = { type: pieceType, player, id: `${player}${pieceType}_promo` }
    const newBoard = structuredClone(board)
    setBoard(newBoard)
    setTurns((prevTurns) => [newBoard, ...prevTurns])
    setPendingPromotion(null)

    const opponent = player === "w" ? "b" : "w"
    const opponentKingCoord = getKingCoord(opponent, newBoard)
    const opponentInCheck = isSquareInCheck(opponentKingCoord, newBoard)
    const opponentHasMoves = getPlayerLegalMoves(opponent, newBoard).length > 0

    if (!opponentHasMoves) {
      setGameStatus(opponentInCheck ? "checkmate" : "stalemate")
    } else if (opponentInCheck) {
      setGameStatus("check")
    } else {
      setGameStatus(null)
    }
  }

  function handleSquareClick(clickedCoord) {
    if (gameStatus === "checkmate" || gameStatus === "stalemate") return
    if (pendingPromotion) return

    const targetPiece = board[clickedCoord.row][clickedCoord.col]
    const selectedPiece = selectedCoord
      ? board[selectedCoord.row][selectedCoord.col]
      : null

    // deselect same square
    if (
      selectedCoord &&
      clickedCoord.row === selectedCoord.row &&
      clickedCoord.col === selectedCoord.col
    ) {
      setSelectedCoord(null)
    }

    // move selected piece
    else if (
      selectedPiece &&
      allowedMoves &&
      allowedMoves.some((m) => m.row === clickedCoord.row && m.col === clickedCoord.col)
    ) {
      movePiece(selectedCoord, clickedCoord)

      // handle castling - move the rook too
      if (selectedPiece.type === 'k' && Math.abs(clickedCoord.col - selectedCoord.col) === 2) {
        const row = selectedCoord.row
        const isKingside = clickedCoord.col > selectedCoord.col
        const rookFromCol = isKingside ? 7 : 0
        const rookToCol = isKingside ? 5 : 3
        const rook = board[row][rookFromCol]
        rook.hasMoved = true
        board[row][rookToCol] = rook
        board[row][rookFromCol] = null
      }

      const newBoard = structuredClone(board)
      setBoard(newBoard)
      setSelectedCoord(null)

      // handle pawn promotion
      const promotionRow = activePlayer === "w" ? 0 : 7
      if (selectedPiece.type === "p" && clickedCoord.row === promotionRow) {
        setPendingPromotion({ coord: clickedCoord, player: activePlayer })
        return
      }

      setTurns((prevTurns) => [newBoard, ...prevTurns])
      const opponent = activePlayer === "w" ? "b" : "w"
      const opponentKingCoord = getKingCoord(opponent, newBoard)
      const opponentInCheck = isSquareInCheck(opponentKingCoord, newBoard)
      const opponentHasMoves = getPlayerLegalMoves(opponent, newBoard).length > 0

      if (!opponentHasMoves) {
        setGameStatus(opponentInCheck ? "checkmate" : "stalemate")
      } else if (opponentInCheck) {
        setGameStatus("check")
      } else {
        setGameStatus(null)
      }
    }

    // select new piece
    else if (targetPiece && targetPiece.player === activePlayer) {
      setSelectedCoord(clickedCoord)
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
    setGameStatus(null)
  }

  function getPlayerLegalMoves(player, board) {
    const moves = []
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const piece = board[row][col]
        if (piece && piece.player === player) {
          const legal = getAllowedMoves({ row, col }, board).filter((move) => {
            const testBoard = structuredClone(board)
            testBoard[move.row][move.col] = testBoard[row][col]
            testBoard[row][col] = null
            return !isSquareInCheck(getKingCoord(player, testBoard), testBoard)
          })
          moves.push(...legal)
        }
      }
    }
    return moves
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

  const checkedKingCoord =
    gameStatus === "check" || gameStatus === "checkmate"
      ? getKingCoord(activePlayer, board)
      : null

  const gameOverMessage =
    gameStatus === "checkmate"
      ? `Checkmate! ${activePlayer === "w" ? "Black" : "White"} wins!`
      : gameStatus === "stalemate"
        ? "Stalemate! It's a draw."
        : null

  return (
    <main className="mx-auto w-full max-w-xl rounded bg-slate-500 p-2">
      <Header logo={reactLogo} />
      {pendingPromotion && (
        <div className="my-1 flex items-center justify-between rounded bg-amber-500 px-3 py-2 font-bold text-white">
          <span>Promote your pawn:</span>
          <div className="flex gap-1">
            {["q", "r", "b", "n"].map((type) => (
              <button
                key={type}
                onClick={() => handlePromotion(type)}
                className="rounded bg-white p-1 hover:bg-gray-200"
              >
                <img className="h-8 w-8" src={pieceImages[`${pendingPromotion.player}${type}`]} />
              </button>
            ))}
          </div>
        </div>
      )}
      {(gameStatus === "check" || gameOverMessage) && (
        <div className="my-1 flex items-center justify-between rounded bg-amber-500 px-3 py-2 font-bold text-white">
          <span>
            {gameOverMessage ?? `${activePlayer === "w" ? "White" : "Black"} is in check!`}
          </span>
          {gameOverMessage && (
            <button
              onClick={resetGame}
              className="rounded bg-white px-4 py-1 text-black hover:bg-gray-200"
            >
              New Game
            </button>
          )}
        </div>
      )}
      <CapturedList pieces={pieces.w.captured} />
      <Board
        board={board}
        onSquareClick={handleSquareClick}
        allowedMoves={allowedMoves}
        selectedCoord={selectedCoord}
        activePlayer={activePlayer}
        checkedKingCoord={checkedKingCoord}
      />
      <CapturedList pieces={pieces.b.captured} />
    </main>
  )
}

export default App
