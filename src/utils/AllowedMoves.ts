import type { Board, Coord } from "./types.js"
export function getAllowedMoves(coord: Coord, board: Board) {
  const piece = board[coord.row]?.[coord.col]

  if (piece) {
    switch (piece.type) {
      case "p":
        return getPawnMoves(coord, board)
        break
      case "r":
        return getRookMoves(coord, board)
        break
      case "b":
        return getBishopMoves(coord, board)
        break
      case "n":
        return getKnightMoves(coord, board)
        break
      case "q":
        return getQueenMoves(coord, board)
        break
      case "k":
        return getKingMoves(coord, board)
        break

      default:
        break
    }
  }
}

export function getPawnMoves(coord: Coord, board: Board) {
  let allowedSquares: Coord[] = []
  const thisPiece = board[coord.row]?.[coord.col]
  if (!thisPiece) return allowedSquares

  const homeRowIndex = thisPiece.player === "w" ? 6 : 1
  const distance = coord.row === homeRowIndex ? 2 : 1
  const direction = thisPiece.player === "w" ? -1 : 1

  // vertical
  for (let i = 0; i < distance; i++) {
    const nextRow = coord.row + (i + 1) * direction
    const nextCol = coord.col

    // stop if outside board
    if (!isSquareInBounds(nextRow, nextCol, board)) break

    // stop if blocked by piece
    const targetPiece = board[nextRow]?.[nextCol]
    if (!targetPiece) {
      allowedSquares.push({ row: nextRow, col: nextCol })
    } else {
      break
    }
  }

  // diag
  for (let lr of [-1, 1]) {
    const captureRow = coord.row + direction
    const captureCol = coord.col + lr

    if (isSquareInBounds(captureRow, captureCol, board)) {
      const targetPiece = board[captureRow]?.[captureCol]
      if (targetPiece && targetPiece.player !== thisPiece.player) {
        allowedSquares.push({ row: captureRow, col: captureCol })
      }
    }
  }

  return allowedSquares
}

export function getRookMoves(coord: Coord, board: Board) {
  let allowedSquares: Coord[] = []
  const thisPiece = board[coord.row]?.[coord.col]
  if (!thisPiece) return allowedSquares

  const directions = [
    { dRow: -1, dCol: 0 }, // up
    { dRow: 1, dCol: 0 }, // down
    { dRow: 0, dCol: -1 }, // left
    { dRow: 0, dCol: 1 }, // right
  ]

  for (const { dRow, dCol } of directions) {
    let row = coord.row + dRow
    let col = coord.col + dCol

    while (isSquareInBounds(row, col, board)) {
      const targetPiece = board[row]?.[col]

      if (!targetPiece) {
        allowedSquares.push({ row, col })
      } else {
        if (targetPiece.player !== thisPiece.player) {
          allowedSquares.push({ row, col })
        }
        break
      }

      row += dRow
      col += dCol
    }
  }

  return allowedSquares
}

export function getBishopMoves(coord: Coord, board: Board) {
  let allowedSquares: Coord[] = []
  const thisPiece = board[coord.row]?.[coord.col]
  if (!thisPiece) return allowedSquares

  const directions = [
    { dRow: -1, dCol: -1 }, // upleft
    { dRow: -1, dCol: 1 }, // upright
    { dRow: 1, dCol: -1 }, // downleft
    { dRow: 1, dCol: 1 }, // downright
  ]

  for (const { dRow, dCol } of directions) {
    let row = coord.row + dRow
    let col = coord.col + dCol

    while (isSquareInBounds(row, col, board)) {
      const piece = board[row]?.[col]

      if (!piece) {
        allowedSquares.push({ row, col })
      } else {
        if (piece.player !== thisPiece.player) {
          allowedSquares.push({ row, col })
        }
        break
      }

      row += dRow
      col += dCol
    }
  }

  return allowedSquares
}

export function getKnightMoves(coord: Coord, board: Board) {
  let allowedSquares: Coord[] = []
  const thisPiece = board[coord.row]?.[coord.col]
  if (!thisPiece) return allowedSquares

  const directions = [
    { dRow: -2, dCol: 1 }, // uur
    { dRow: -1, dCol: 2 }, // urr
    { dRow: 1, dCol: 2 }, // drr
    { dRow: 2, dCol: 1 }, // ddr
    { dRow: -2, dCol: -1 }, // uul
    { dRow: -1, dCol: -2 }, // ull
    { dRow: 1, dCol: -2 }, // dll
    { dRow: 2, dCol: -1 }, // ddl
  ]

  for (const { dRow, dCol } of directions) {
    let row = coord.row + dRow
    let col = coord.col + dCol
    if (isSquareInBounds(row, col, board)) {
      const targetPiece = board[row]?.[col]

      if (!targetPiece) {
        allowedSquares.push({ row, col })
      } else {
        if (targetPiece.player !== thisPiece.player) {
          allowedSquares.push({ row, col })
        }
      }
    }
  }

  return allowedSquares
}

export function getQueenMoves(coord: Coord, board: Board) {
  let allowedSquares: Coord[] = []
  const thisPiece = board[coord.row]?.[coord.col]
  if (!thisPiece) return allowedSquares

  const directions = [
    { dRow: -1, dCol: -1 }, // upleft
    { dRow: -1, dCol: 1 }, // upright
    { dRow: 1, dCol: -1 }, // downleft
    { dRow: 1, dCol: 1 }, // downright
    { dRow: -1, dCol: 0 }, // up
    { dRow: 1, dCol: 0 }, // down
    { dRow: 0, dCol: -1 }, // left
    { dRow: 0, dCol: 1 }, // right
  ]

  for (const { dRow, dCol } of directions) {
    let row = coord.row + dRow
    let col = coord.col + dCol

    while (isSquareInBounds(row, col, board)) {
      const piece = board[row]?.[col]

      if (!piece) {
        allowedSquares.push({ row, col })
      } else {
        if (piece.player !== thisPiece.player) {
          allowedSquares.push({ row, col })
        }
        break
      }

      row += dRow
      col += dCol
    }
  }

  return allowedSquares
}

export function getKingMoves(coord: Coord, board: Board) {
  let allowedSquares: Coord[] = []
  const thisPiece = board[coord.row]?.[coord.col]
  if (!thisPiece) return allowedSquares

  const directions = [
    { dRow: -1, dCol: -1 }, // upleft
    { dRow: -1, dCol: 1 }, // upright
    { dRow: 1, dCol: -1 }, // downleft
    { dRow: 1, dCol: 1 }, // downright
    { dRow: -1, dCol: 0 }, // up
    { dRow: 1, dCol: 0 }, // down
    { dRow: 0, dCol: -1 }, // left
    { dRow: 0, dCol: 1 }, // right
  ]

  for (const { dRow, dCol } of directions) {
    let row = coord.row + dRow
    let col = coord.col + dCol

    if (isSquareInBounds(row, col, board)) {
      const piece = board[row]?.[col]

      if (!piece) {
        allowedSquares.push({ row, col })
      } else {
        if (piece.player !== thisPiece.player) {
          allowedSquares.push({ row, col })
        }
      }
    }
  }

  // castling
  if (!thisPiece.hasMoved) {
    const row = coord.row

    // kingside
    const kingsideRook = board[row]?.[7]
    if (kingsideRook?.type === 'r' && !kingsideRook.hasMoved) {
      if (!board[row]?.[5] && !board[row]?.[6]) {
        allowedSquares.push({ row, col: 6 })
      }
    }

    // queenside
    const queensideRook = board[row]?.[0]
    if (queensideRook?.type === 'r' && !queensideRook.hasMoved) {
      if (!board[row]?.[1] && !board[row]?.[2] && !board[row]?.[3]) {
        allowedSquares.push({ row, col: 2 })
      }
    }
  }

  return allowedSquares
}

function isSquareInBounds(row: number, col: number, board: Board) {
  return (
    row >= 0 && row <= board.length - 1 && col >= 0 && col <= board.length - 1
  )
}
