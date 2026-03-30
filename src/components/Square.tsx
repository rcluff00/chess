import { pieceImages } from "../utils/Pieces.js"
import type { Piece } from "../utils/types.ts"

type SquareProps = {
  piece: Piece | null
  isDark: boolean
  isSelected: boolean
  isAllowedMove: boolean
  isInCheck: boolean
  onClick: () => void
}

export default function Square({
  piece,
  isDark,
  isSelected,
  isAllowedMove,
  isInCheck,
  onClick,
}: SquareProps) {
  let squareClasses =
    "flex aspect-square cursor-pointer items-center justify-center box-border border-4"

  if (isDark) {
    squareClasses += " bg-gray-400"
  } else {
    squareClasses += " bg-gray-200"
  }

  if (isInCheck) {
    squareClasses += " border-amber-500 z-10 shadow-xl"
  } else if (piece && isSelected) {
    squareClasses += " border-cyan-300 z-10 shadow-xl"
  } else {
    squareClasses += " border-transparent"
  }

  let pieceClasses = "items-center flex h-3/4 w-3/4 justify-center rounded-full"
  pieceClasses += isAllowedMove ? " bg-cyan-300/50" : " bg-cyan-300/0"

  return (
    <div onClick={onClick} className={squareClasses}>
      <div className={pieceClasses}>
        {piece && (
          <img
            src={pieceImages[`${piece.player}${piece.type}`]}
          />
        )}
      </div>
    </div>
  )
}
