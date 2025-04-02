// Piece identifiers
export const PIECE_IDS = {
  LEFT: "left",
  RIGHT: "right",
} as const

export type PieceId = typeof PIECE_IDS[keyof typeof PIECE_IDS]

// Piece metadata
export const PIECE_METADATA = {
  [PIECE_IDS.LEFT]: {
    offsetX: -3,  // Initial offset for left piece
    highlight: "#3498db", // Blue highlight
    controls: {
      left: "A",
      right: "D",
      down: "S",
      rotate: "W",
      hardDrop: "Q",
    },
  },
  [PIECE_IDS.RIGHT]: {
    offsetX: 3,   // Initial offset for right piece
    highlight: "#e67e22", // Orange highlight
    controls: {
      left: "←",
      right: "→",
      down: "↓",
      rotate: "↑",
      hardDrop: "Space",
    },
  },
} as const

// Component types for ECS approach
export const COMPONENT_TYPES = {
  POSITION: "position",
  SHAPE: "shape",
  COLOR: "color",
  ROTATION: "rotation",
  TYPE: "type",
  GHOST: "ghost",
} as const

export type ComponentType = typeof COMPONENT_TYPES[keyof typeof COMPONENT_TYPES]
