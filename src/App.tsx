import { useState, useEffect, useRef } from "react"
import reactLogo from "./assets/react.svg"
import Header from "./components/Header.js"
import Board from "./components/Board.js"
import { INITIAL_BOARD } from "./utils/InitialBoard.js"
import { getAllowedMoves } from "./utils/AllowedMoves.js"
import { pieceImages } from "./utils/Pieces.js"
import CapturedList from "./components/CapturedList.js"
import type { Board as BoardType, Coord, Piece, Player, PieceType } from "./utils/types.js"

import "./App.css"

type GameStatus = "check" | "checkmate" | "stalemate" | null
type PendingPromotion = { coord: Coord; player: Player } | null
type PlayerPieces = Record<Player, { remaining: Piece[]; captured: Piece[] }>

function getOpponent(player: Player): Player {
  return player === "w" ? "b" : "w"
}

function App() {
  const [turns, setTurns] = useState<BoardType[]>([])
  const [board, setBoard] = useState<BoardType>(structuredClone(INITIAL_BOARD))
  const [selectedCoord, setSelectedCoord] = useState<Coord | null>(null)
  const [gameStatus, setGameStatus] = useState<GameStatus>(null)
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion>(null)

  const turnsRef = useRef(turns)
  useEffect(() => {
    turnsRef.current = turns
  }, [turns])

  const pieces = getPieces(board)
  const activePlayer = getActivePlayer(turns)
  const allowedMoves = selectedCoord
    ? getAllowedMoves(selectedCoord, board).filter((move) => {
        const selectedPiece = board[selectedCoord.row]?.[selectedCoord.col]
        const isCastle = selectedPiece?.type === "k" && Math.abs(move.col - selectedCoord.col) === 2

        if (isCastle) {
          if (isSquareInCheck(selectedCoord, board)) return false
          const intermediateCol = (selectedCoord.col + move.col) / 2
          const testBoard2 = structuredClone(board)
          testBoard2[selectedCoord.row]![intermediateCol] = testBoard2[selectedCoord.row]![selectedCoord.col] ?? null
          testBoard2[selectedCoord.row]![selectedCoord.col] = null
          if (isSquareInCheck({ row: selectedCoord.row, col: intermediateCol }, testBoard2)) return false
        }

        const testBoard = structuredClone(board)
        testBoard[move.row]![move.col] = testBoard[selectedCoord.row]![selectedCoord.col] ?? null
        testBoard[selectedCoord.row]![selectedCoord.col] = null
        const kingCoord = getKingCoord(activePlayer, testBoard)
        return !isSquareInCheck(kingCoord, testBoard)
      })
    : []

  function getKingCoord(player: Player, board: BoardType): Coord | undefined {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row]!.length; col++) {
        const piece = board[row]![col]
        if (piece) {
          if (piece.type === "k" && piece.player === player) return { row, col }
        }
      }
    }
  }

  function getPieces(board: BoardType): PlayerPieces {
    const allInitial = INITIAL_BOARD.flat().filter((p): p is Piece => p !== null)
    const allRemaining = board.flat().filter((p): p is Piece => p !== null)

    function forPlayer(player: Player) {
      const initial = allInitial.filter((p) => p.player === player)
      const remaining = allRemaining.filter((p) => p.player === player)
      const captured = initial.filter((p) => !remaining.some((r) => r.id === p.id))
      return { remaining, captured }
    }

    return { w: forPlayer("w"), b: forPlayer("b") }
  }

  function movePiece(board: BoardType, prevCoord: Coord, targetCoord: Coord): BoardType {
    const newBoard = structuredClone(board)
    const piece = newBoard[prevCoord.row]![prevCoord.col]!
    piece.hasMoved = true
    newBoard[prevCoord.row]![prevCoord.col] = null
    newBoard[targetCoord.row]![targetCoord.col] = piece
    return newBoard
  }

  function getActivePlayer(turns: BoardType[]): Player {
    return turns.length % 2 ? "b" : "w"
  }

  function resetGame() {
    setBoard(structuredClone(INITIAL_BOARD))
    setTurns([])
    setSelectedCoord(null)
    setGameStatus(null)
    setPendingPromotion(null)
  }

  function handlePromotion(pieceType: PieceType) {
    if (!pendingPromotion) return
    const { coord, player } = pendingPromotion
    board[coord.row]![coord.col] = { type: pieceType, player, id: `${player}${pieceType}_promo` }
    const newBoard = structuredClone(board)
    setBoard(newBoard)
    setTurns((prevTurns) => [newBoard, ...prevTurns])
    setPendingPromotion(null)

    const opp = getOpponent(player)
    const opponentKingCoord = getKingCoord(opp, newBoard)
    const opponentInCheck = isSquareInCheck(opponentKingCoord, newBoard)
    const opponentHasMoves = getPlayerLegalMoves(opp, newBoard).length > 0

    if (!opponentHasMoves) {
      setGameStatus(opponentInCheck ? "checkmate" : "stalemate")
    } else if (opponentInCheck) {
      setGameStatus("check")
    } else {
      setGameStatus(null)
    }
  }

  function handleSquareClick(clickedCoord: Coord) {
    if (gameStatus === "checkmate" || gameStatus === "stalemate") return
    if (pendingPromotion) return

    const targetPiece = board[clickedCoord.row]?.[clickedCoord.col]
    const selectedPiece = selectedCoord
      ? board[selectedCoord.row]?.[selectedCoord.col]
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
      selectedCoord &&
      allowedMoves &&
      allowedMoves.some((m) => m.row === clickedCoord.row && m.col === clickedCoord.col)
    ) {
      let newBoard = movePiece(board, selectedCoord, clickedCoord)

      // handle castling - move the rook too
      if (selectedPiece.type === "k" && Math.abs(clickedCoord.col - selectedCoord.col) === 2) {
        const row = selectedCoord.row
        const isKingside = clickedCoord.col > selectedCoord.col
        const rookFromCol = isKingside ? 7 : 0
        const rookToCol = isKingside ? 5 : 3
        const rook = newBoard[row]![rookFromCol]!
        rook.hasMoved = true
        newBoard[row]![rookToCol] = rook
        newBoard[row]![rookFromCol] = null
      }

      setBoard(newBoard)
      setSelectedCoord(null)

      // handle pawn promotion
      const promotionRow = activePlayer === "w" ? 0 : 7
      if (selectedPiece.type === "p" && clickedCoord.row === promotionRow) {
        setPendingPromotion({ coord: clickedCoord, player: activePlayer })
        return
      }

      setTurns((prevTurns) => [newBoard, ...prevTurns])
      const opp = getOpponent(activePlayer)
      const opponentKingCoord = getKingCoord(opp, newBoard)
      const opponentInCheck = isSquareInCheck(opponentKingCoord, newBoard)
      const opponentHasMoves = getPlayerLegalMoves(opp, newBoard).length > 0

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
    const handleKeyDown = (event: KeyboardEvent) => {
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

  function getPlayerLegalMoves(player: Player, board: BoardType): Coord[] {
    const moves: Coord[] = []
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row]!.length; col++) {
        const piece = board[row]![col]
        if (piece && piece.player === player) {
          const legal = getAllowedMoves({ row, col }, board).filter((move) => {
            const testBoard = structuredClone(board)
            testBoard[move.row]![move.col] = testBoard[row]![col] ?? null
            testBoard[row]![col] = null
            return !isSquareInCheck(getKingCoord(player, testBoard), testBoard)
          })
          moves.push(...legal)
        }
      }
    }
    return moves
  }

  function isSquareInCheck(coord: Coord | undefined, board: BoardType): boolean {
    if (!coord) return false
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row]!.length; col++) {
        const piece = board[row]![col]
        if (piece) {
          const allowedMoves = getAllowedMoves({ row, col }, board)
          if (allowedMoves.some((m) => m.row === coord.row && m.col === coord.col)) {
            return true
          }
        }
      }
    }
    return false
  }

  const checkedKingCoord =
    gameStatus === "check" || gameStatus === "checkmate"
      ? getKingCoord(activePlayer, board) ?? null
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
                onClick={() => handlePromotion(type as PieceType)}
                className="rounded bg-white p-1 hover:bg-gray-200"
              >
                <img className="h-8 w-8" src={pieceImages[`${pendingPromotion.player}${type as PieceType}`]} />
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
