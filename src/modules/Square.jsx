import { pieceImages } from "../utils/Pieces"

export default function Square({
  piece,
  isDark,
  isSelected,
  isAllowedMove,
  onClick,
}) {
  let squareClasses =
    "flex aspect-square cursor-pointer items-center justify-center box-border border-4"

  if (isDark) {
    squareClasses += " bg-gray-400"
  } else {
    squareClasses += " bg-gray-200"
  }

  squareClasses +=
    piece && isSelected
      ? " border-cyan-300 z-10 shadow-xl"
      : " border-transparent"

  let pieceClasses = "items-center flex h-3/4 w-3/4 justify-center rounded-full"
  pieceClasses += isAllowedMove ? " bg-cyan-300/50" : " bg-cyan-300/0"
  // pieceClasses += piece && piece.player === 1 ? " text-black" : ""

  return (
    <div onClick={onClick} className={squareClasses}>
      <div className={pieceClasses}>
        {piece && (
          <img
            src={pieceImages[`${piece.player === 0 ? "w" : "b"}${piece.type}`]}
          />
        )}
      </div>
    </div>
  )
}
