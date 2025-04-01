export interface Position {
  x: number
  y: number
}

export interface Cell {
  filled: boolean
  color: string
  isGhost?: boolean
  isTrail?: boolean
  isActive?: boolean
  isRightPiece?: boolean
  isLeftPiece?: boolean
}

export type TetrominoType = "I" | "J" | "L" | "O" | "S" | "T" | "Z"

export interface Tetromino {
  type: TetrominoType
  shape: boolean[][]
  color: string
  position: Position
  rotation: number // Add rotation tracking: 0, 1, 2, 3 for the four possible orientations
}

export interface GameState {
  board: Cell[][]
  currentPiece: Tetromino | null
  nextPiece: Tetromino | null
  score: number
  level: number
  lines: number
  gameOver: boolean
  paused: boolean
}
