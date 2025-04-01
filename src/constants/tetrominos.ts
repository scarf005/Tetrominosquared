import type { TetrominoType } from "@/types"

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20

export const TETROMINO_SHAPES: Record<TetrominoType, boolean[][]> = {
  I: [
    [false, false, false, false],
    [true, true, true, true],
    [false, false, false, false],
    [false, false, false, false],
  ],
  J: [
    [true, false, false],
    [true, true, true],
    [false, false, false],
  ],
  L: [
    [false, false, true],
    [true, true, true],
    [false, false, false],
  ],
  O: [
    [true, true],
    [true, true],
  ],
  S: [
    [false, true, true],
    [true, true, false],
    [false, false, false],
  ],
  T: [
    [false, true, false],
    [true, true, true],
    [false, false, false],
  ],
  Z: [
    [true, true, false],
    [false, true, true],
    [false, false, false],
  ],
}

export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: "#00FFFF", // Cyan
  J: "#0000FF", // Blue
  L: "#FF8000", // Orange
  O: "#FFFF00", // Yellow
  S: "#00FF00", // Green
  T: "#800080", // Purple
  Z: "#FF0000", // Red
}

// Wall kick data (JLSTZ pieces)
export const WALL_KICK_DATA = [
  // 0->1
  [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, {
    x: -1,
    y: -2,
  }],
  // 1->2
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, {
    x: 1,
    y: 2,
  }],
  // 2->3
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, {
    x: 1,
    y: -2,
  }],
  // 3->0
  [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, {
    x: -1,
    y: 2,
  }],
]

// I piece has different wall kick data
export const WALL_KICK_I = [
  // 0->1
  [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: -1 }, {
    x: 1,
    y: 2,
  }],
  // 1->2
  [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 2 }, {
    x: 2,
    y: -1,
  }],
  // 2->3
  [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 1 }, {
    x: -1,
    y: -2,
  }],
  // 3->0
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: -2 }, {
    x: -2,
    y: 1,
  }],
]

// O piece doesn't need wall kicks as it's the same in any rotation
export const WALL_KICK_O = [
  [{ x: 0, y: 0 }],
  [{ x: 0, y: 0 }],
  [{ x: 0, y: 0 }],
  [{ x: 0, y: 0 }],
]
