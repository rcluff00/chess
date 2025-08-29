import { useState } from "react"
import { getAllowedMoves } from "../utils/AllowedMoves"
import { INITIAL_BOARD } from "../utils/InitalBoard"
import Square from "./Square"

export default function Board() {
  const [board, setBoard] = useState(INITIAL_BOARD)
  const [selectedCoord, setSelectedCoord] = useState(null)
  const allowedMoves = selectedCoord
    ? getAllowedMoves(selectedCoord, board)
    : []

  function movePiece(prevCoord, targetCoord) {
    const piece = board[prevCoord.row][prevCoord.col]
    board[prevCoord.row][prevCoord.col] = null // remove piece
    board[targetCoord.row][targetCoord.col] = piece // replace piece

    setBoard(board)
    setSelectedCoord(null)
    setTurns((prevTurns) => {
      const updatedTurns = [board, ...prevTurns]

      return updatedTurns
    })
  }

  function handleSquareClick(coord) {
    const { row, col } = coord

    // deselect same square
    if (
      selectedCoord &&
      row === selectedCoord.row &&
      col === selectedCoord.col
    ) {
      setSelectedCoord(null)
    }

    // move to valid square
    else if (
      allowedMoves &&
      allowedMoves.some((m) => m.row === row && m.col === col)
    ) {
      movePiece(selectedCoord, coord)
    }

    // select new piece
    else {
      setSelectedCoord(coord)
    }
  }

  return (
    <div className="grid grid-cols-8">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const coord = { row: rowIndex, col: colIndex }
          const key = `${rowIndex},${colIndex}`
          const isAllowedMove =
            allowedMoves &&
            allowedMoves.some((m) => m.row === rowIndex && m.col === colIndex)
          const isSelected =
            selectedCoord?.row === rowIndex && selectedCoord?.col === colIndex

          return (
            <Square
              key={key}
              piece={piece}
              isAllowedMove={isAllowedMove}
              isSelected={isSelected}
              isDark={(rowIndex + colIndex) % 2 === 1}
              onClick={() => handleSquareClick(coord)}
            />
          )
        }),
      )}
    </div>
  )
}
