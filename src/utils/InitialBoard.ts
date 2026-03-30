import type { Board } from "./types.js"

const BACK_RANK = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'] as const

export const INITIAL_BOARD = (() => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null))

  BACK_RANK.forEach((type, col) => {
    board[0]![col] = { type, player: 'b', id: `b${type}${col}` }
    board[7]![col] = { type, player: 'w', id: `w${type}${col}` }
  })

  for (let col = 0; col < 8; col++) {
    board[1]![col] = { type: 'p', player: 'b', id: `bp${col + 1}` }
    board[6]![col] = { type: 'p', player: 'w', id: `wp${col + 1}` }
  }

  return board
})()
