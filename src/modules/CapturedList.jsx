import { pieceImages } from "../utils/Pieces"

export default function CapturedList({ pieces }) {
  return (
    <div className="grid grid-cols-16 p-2">
      {pieces &&
        pieces.map((piece) => (
          <img
            key={piece.id}
            className=""
            src={pieceImages[`${piece.player}${piece.type}`]}
          />
        ))}
    </div>
  )
}
