import Square from "./Square"

export default function Board({
  board,
  onSquareClick,
  allowedMoves,
  selectedCoord,
}) {
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
              onClick={() => onSquareClick(coord)}
            />
          )
        }),
      )}
    </div>
  )
}
