import Square from "./Square"

export default function Board({
  board,
  onSquareClick,
  allowedMoves,
  selectedCoord,
  activePlayer,
  checkedKingCoord,
}) {
  const borderClass = activePlayer === "w"
    ? "border-b-4 border-t-4 border-b-cyan-300 border-t-transparent"
    : "border-b-4 border-t-4 border-t-cyan-300 border-b-transparent"

  return (
    <div className={`grid grid-cols-8 ${borderClass}`}>
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const coord = { row: rowIndex, col: colIndex }
          const key = `${rowIndex},${colIndex}`
          const isAllowedMove =
            allowedMoves &&
            allowedMoves.some((m) => m.row === rowIndex && m.col === colIndex)
          const isSelected =
            selectedCoord?.row === rowIndex && selectedCoord?.col === colIndex
          const isInCheck =
            checkedKingCoord?.row === rowIndex && checkedKingCoord?.col === colIndex

          return (
            <Square
              key={key}
              piece={piece}
              isAllowedMove={isAllowedMove}
              isSelected={isSelected}
              isInCheck={isInCheck}
              isDark={(rowIndex + colIndex) % 2 === 1}
              onClick={() => onSquareClick(coord)}
            />
          )
        }),
      )}
    </div>
  )
}
