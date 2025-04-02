import type { Cell, Tetromino } from "@/types/index.ts"
import { BOARD_HEIGHT, BOARD_WIDTH } from "@/constants/tetrominos"

export function createEmptyBoard(): Cell[][] {
  return Array(BOARD_HEIGHT).fill(null).map(() =>
    Array(BOARD_WIDTH).fill(null).map(() => ({
      filled: false,
      color: "",
    }))
  )
}

export function lockPieceToBoard(piece: Tetromino, board: Cell[][]): Cell[][] {
  // Create a new board to avoid mutating the original
  const newBoard = board.map((row) => [...row])

  // Add the piece to the board
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardX = piece.position.x + x
        const boardY = piece.position.y + y

        if (
          boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 &&
          boardX < BOARD_WIDTH
        ) {
          newBoard[boardY][boardX] = {
            filled: true,
            color: piece.color,
          }
        }
      }
    }
  }

  return newBoard
}

export function clearLines(board: Cell[][], level: number): {
  newBoard: Cell[][]
  linesCleared: number
  scoreToAdd: number
} {
  let linesCleared = 0
  const newBoard = [...board]

  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    const isLineComplete = newBoard[y].every((cell) => cell.filled)

    if (isLineComplete) {
      linesCleared++

      // Move all lines above down
      for (let y2 = y; y2 > 0; y2--) {
        newBoard[y2] = [...newBoard[y2 - 1]]
      }

      // Create empty top line
      newBoard[0] = Array(BOARD_WIDTH).fill(null).map(() => ({
        filled: false,
        color: "",
      }))

      y++ // Check the same line again as it's now filled with the line above
    }
  }

  // Calculate score based on lines cleared
  const scoreToAdd = calculateScore(linesCleared, level)

  return {
    newBoard,
    linesCleared,
    scoreToAdd,
  }
}

function calculateScore(linesCleared: number, level: number): number {
  const linePoints = [0, 40, 100, 300, 1200]
  return linePoints[linesCleared] * level
}
