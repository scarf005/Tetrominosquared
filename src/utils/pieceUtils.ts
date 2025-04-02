import type { Position, Tetromino } from "@/types/index.ts"
import { BOARD_HEIGHT, BOARD_WIDTH } from "@/constants/tetrominos"

export function rotateMatrix(matrix: boolean[][]): boolean[][] {
  const rows = matrix.length
  const cols = matrix[0].length
  const rotated = Array(cols).fill(null).map(() => Array(rows).fill(false))

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      rotated[x][rows - 1 - y] = matrix[y][x]
    }
  }

  return rotated
}

export function checkCollisionWithBoard(
  piece: Tetromino,
  position: Position,
  board: { filled: boolean; color: string }[][],
): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = position.x + x
        const newY = position.y + y

        // Check if outside board boundaries
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return true
        }

        // Check if collides with another piece on the board
        if (newY >= 0 && board[newY][newX].filled) {
          return true
        }
      }
    }
  }
  return false
}

export function checkCollisionBetweenPieces(
  piece1: Tetromino,
  piece2: Tetromino | null,
): boolean {
  if (!piece2) return false

  for (let y1 = 0; y1 < piece1.shape.length; y1++) {
    for (let x1 = 0; x1 < piece1.shape[y1].length; x1++) {
      if (piece1.shape[y1][x1]) {
        const pos1X = piece1.position.x + x1
        const pos1Y = piece1.position.y + y1

        for (let y2 = 0; y2 < piece2.shape.length; y2++) {
          for (let x2 = 0; x2 < piece2.shape[y2].length; x2++) {
            if (piece2.shape[y2][x2]) {
              const pos2X = piece2.position.x + x2
              const pos2Y = piece2.position.y + y2

              if (pos1X === pos2X && pos1Y === pos2Y) {
                return true // Collision detected
              }
            }
          }
        }
      }
    }
  }
  return false
}

export function calculateGhostPosition(
  piece: Tetromino,
  otherPiece: Tetromino | null,
  board: { filled: boolean; color: string }[][],
): Position {
  let ghostY = piece.position.y
  const ghostX = piece.position.x

  while (
    !checkCollisionWithBoard(piece, { x: ghostX, y: ghostY + 1 }, board) &&
    !checkCollisionBetweenPieces(
      { ...piece, position: { x: ghostX, y: ghostY + 1 } },
      otherPiece,
    )
  ) {
    ghostY++
  }

  return { x: ghostX, y: ghostY }
}
