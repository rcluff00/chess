export type PieceType = 'r' | 'n' | 'b' | 'q' | 'k' | 'p'
export type Player = 'w' | 'b'

export type Piece = {
  player: Player
  type: PieceType
  id: string
  hasMoved?: boolean
}

export type Coord = {
  row: number
  col: number
}
