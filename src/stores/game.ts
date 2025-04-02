import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { Cell, Position, Tetromino, TetrominoType } from "@/types/index.ts"
import {
  BOARD_WIDTH,
  TETROMINO_COLORS,
  TETROMINO_SHAPES,
  WALL_KICK_DATA,
  WALL_KICK_I,
  WALL_KICK_O,
} from "@/constants/tetrominos.ts"
import {
  calculateGhostPosition,
  checkCollisionBetweenPieces,
  checkCollisionWithBoard,
  rotateMatrix,
} from "@/utils/pieceUtils.ts"
import {
  clearLines,
  createEmptyBoard,
  lockPieceToBoard,
} from "@/utils/boardUtils.ts"
import {
  COMPONENT_TYPES,
  PIECE_IDS,
  PIECE_METADATA,
  type PieceId
} from "@/constants/pieces.ts"

export const useGameStore = defineStore("game", () => {
  // State
  const board = ref<Cell[][]>(createEmptyBoard())

  // Store pieces in maps
  const currentPieces = ref<Map<PieceId, Tetromino | null>>(new Map([
    [PIECE_IDS.LEFT, null],
    [PIECE_IDS.RIGHT, null]
  ]))

  const nextPieces = ref<Map<PieceId, Tetromino | null>>(new Map([
    [PIECE_IDS.LEFT, null],
    [PIECE_IDS.RIGHT, null]
  ]))

  // Add drop timers for each piece
  const pieceDropCounters = ref<Map<PieceId, number>>(new Map([
    [PIECE_IDS.LEFT, 0],
    [PIECE_IDS.RIGHT, 0]
  ]))

  const score = ref(0)
  const level = ref(1)
  const lines = ref(0)
  const gameOver = ref(false)
  const paused = ref(false)
  const gameLoopInterval = ref<number | null>(null)

  // Add a constant for the game loop refresh rate (60fps)
  const GAME_LOOP_INTERVAL = 16 // 16ms = ~60fps

  // Define different base drop intervals for each piece
  const BASE_DROP_INTERVALS = {
    [PIECE_IDS.LEFT]: 1091,
    [PIECE_IDS.RIGHT]: 977,
  } as const

  // Individual drop interval calculation for each piece
  const getDropInterval = (pieceId: PieceId) => {
    const baseInterval = BASE_DROP_INTERVALS[pieceId]
    // Still apply level-based speed increases to both pieces
    return Math.max(100, baseInterval - level.value * 100)
  }

  // Compute ghost positions for all pieces
  const ghostPiecePositions = computed(() => {
    const positions = new Map<PieceId, Position | null>()

    // For each piece, calculate its ghost position
    for (const [id, piece] of currentPieces.value.entries()) {
      if (!piece) {
        positions.set(id, null)
        continue
      }

      // Get the other piece for collision detection
      const otherPieceId = id === PIECE_IDS.LEFT ? PIECE_IDS.RIGHT : PIECE_IDS.LEFT
      const otherPiece = currentPieces.value.get(otherPieceId) ?? null

      positions.set(id, calculateGhostPosition(piece, otherPiece, board.value))
    }

    return positions
  })

  // Actions
  function createRandomPiece(pieceId: PieceId): Tetromino {
    const types: TetrominoType[] = ["I", "J", "L", "O", "S", "T", "Z"]
    const type = types[Math.floor(Math.random() * types.length)]
    const metadata = PIECE_METADATA[pieceId]

    return {
      type,
      shape: TETROMINO_SHAPES[type],
      color: TETROMINO_COLORS[type],
      position: {
        x: Math.floor(BOARD_WIDTH / 2) -
          Math.floor(TETROMINO_SHAPES[type][0].length / 2) + metadata.offsetX,
        y: 0,
      },
      rotation: 0,
    }
  }

  function startGame() {
    resetGame()
    gameOver.value = false
    paused.value = false

    // Create both next pieces
    Object.values(PIECE_IDS).forEach(id => {
      nextPieces.value.set(id, createRandomPiece(id))
    })

    // Spawn the initial pieces
    spawnPiece(PIECE_IDS.LEFT)
    spawnPiece(PIECE_IDS.RIGHT)

    startGameLoop()
  }

  function resetGame() {
    board.value = createEmptyBoard()

    // Reset all pieces
    Object.values(PIECE_IDS).forEach(id => {
      currentPieces.value.set(id, null)
      nextPieces.value.set(id, null)
      pieceDropCounters.value.set(id, 0)
    })

    score.value = 0
    level.value = 1
    lines.value = 0
    stopGameLoop()
  }

  // Generic spawn piece function
  function spawnPiece(pieceId: PieceId) {
    const nextPiece = nextPieces.value.get(pieceId)
    if (!nextPiece) {
      nextPieces.value.set(pieceId, createRandomPiece(pieceId))
      return
    }

    // Set current piece to next piece
    currentPieces.value.set(pieceId, nextPiece)

    // Create a new next piece
    nextPieces.value.set(pieceId, createRandomPiece(pieceId))

    // Get the other piece ID for collision checks
    const otherPieceId = pieceId === PIECE_IDS.LEFT ? PIECE_IDS.RIGHT : PIECE_IDS.LEFT
    const otherPiece = currentPieces.value.get(otherPieceId)

    // Ensure new piece doesn't overlap with existing piece
    const currentPiece = currentPieces.value.get(pieceId)
    if (currentPiece && otherPiece && checkCollisionBetweenPieces(currentPiece, otherPiece)) {
      // Try to adjust horizontally if there's overlap
      if (currentPiece.position.x > BOARD_WIDTH / 2) {
        currentPiece.position.x -= pieceId === PIECE_IDS.LEFT ? 2 : -2
      } else {
        currentPiece.position.x += pieceId === PIECE_IDS.LEFT ? -3 : 3
      }
    }

    // Check for game over only if collision with board
    const piece = currentPieces.value.get(pieceId)
    if (piece && checkCollisionWithBoard(piece, piece.position, board.value)) {
      gameOver.value = true
      stopGameLoop()
    }

    // Reset the piece drop counter when spawning a new piece
    pieceDropCounters.value.set(pieceId, 0)
  }

  // Generic movement function for any piece
  function movePiece(pieceId: PieceId, dx: number, dy: number) {
    if (gameOver.value || paused.value) return

    const piece = currentPieces.value.get(pieceId)
    if (!piece) return

    const newPosition: Position = {
      x: piece.position.x + dx,
      y: piece.position.y + dy,
    }

    // Get the other piece for collision checks
    const otherPieceId = pieceId === PIECE_IDS.LEFT ? PIECE_IDS.RIGHT : PIECE_IDS.LEFT
    const otherPiece = currentPieces.value.get(otherPieceId)

    // Check collision with board and other piece
    const boardCollision = checkCollisionWithBoard(
      piece,
      newPosition,
      board.value,
    )

    const pieceCollision = checkCollisionBetweenPieces(
      { ...piece, position: newPosition },
      otherPiece,
    )

    if (!boardCollision && !pieceCollision) {
      // If no collision, just move the piece
      piece.position = newPosition
    } else if (dy > 0) {
      // If collision happened during downward movement,
      // only lock if it hit the board, NOT if it hit the other piece
      if (boardCollision) {
        lockPiece(pieceId)
      }
      // If it hit the other piece, don't lock - it's not "landed"
    }
  }

  // Generic rotation function for any piece
  function rotatePiece(pieceId: PieceId) {
    if (gameOver.value || paused.value) return

    const piece = currentPieces.value.get(pieceId)
    if (!piece) return

    // Get the other piece for collision checks
    const otherPieceId = pieceId === PIECE_IDS.LEFT ? PIECE_IDS.RIGHT : PIECE_IDS.LEFT
    const otherPiece = currentPieces.value.get(otherPieceId) ?? null

    tryRotatePiece(piece, otherPiece, pieceId)
  }

  // Generic hard drop function for any piece
  function hardDropPiece(pieceId: PieceId) {
    if (gameOver.value || paused.value) return

    const piece = currentPieces.value.get(pieceId)
    if (!piece) return

    // Get the other piece for collision checks
    const otherPieceId = pieceId === PIECE_IDS.LEFT ? PIECE_IDS.RIGHT : PIECE_IDS.LEFT
    const otherPiece = currentPieces.value.get(otherPieceId) ?? null

    performHardDrop(piece, otherPiece, pieceId)
  }

  // Helper for rotation - now operates on piece objects directly
  function tryRotatePiece(
    piece: Tetromino,
    otherPiece: Tetromino | null,
    pieceId: PieceId
  ) {
    const currentRotation = piece.rotation
    const newRotation = (currentRotation + 1) % 4

    const rotatedShape = rotateMatrix(piece.shape)
    const newPiece = {
      ...piece,
      shape: rotatedShape,
      rotation: newRotation,
    }

    // Determine which wall kick data to use based on piece type
    let kickData
    if (piece.type === "I") {
      kickData = WALL_KICK_I[currentRotation]
    } else if (piece.type === "O") {
      kickData = WALL_KICK_O[currentRotation]
    } else {
      kickData = WALL_KICK_DATA[currentRotation]
    }

    // Try each possible kick position
    for (const kick of kickData) {
      const testPosition = {
        x: piece.position.x + kick.x,
        y: piece.position.y + kick.y,
      }

      // Check for collisions with both the board and the other piece
      if (
        !checkCollisionWithBoard(newPiece, testPosition, board.value) &&
        !checkCollisionBetweenPieces(
          { ...newPiece, position: testPosition },
          otherPiece,
        )
      ) {
        // This position works - apply the rotation and the position offset
        currentPieces.value.set(pieceId, {
          ...newPiece,
          position: testPosition,
        })
        return // Exit after finding a valid position
      }
    }
    // If we got here, no valid rotation position was found
  }

  // Helper for hard drop - now operates on piece objects directly
  function performHardDrop(
    piece: Tetromino,
    otherPiece: Tetromino | null,
    pieceId: PieceId
  ) {
    // Calculate the drop distance considering board and the other piece
    let dropY = piece.position.y

    while (
      !checkCollisionWithBoard(
        piece,
        { x: piece.position.x, y: dropY + 1 },
        board.value,
      ) &&
      !checkCollisionBetweenPieces(
        { ...piece, position: { x: piece.position.x, y: dropY + 1 } },
        otherPiece,
      )
    ) {
      dropY++
      score.value += 1 // Add 1 point for each cell dropped
    }

    // Apply the drop
    const updatedPiece = { ...piece, position: { ...piece.position, y: dropY } }
    currentPieces.value.set(pieceId, updatedPiece)

    // For hard drops, we only lock if it's hitting the board, not another piece
    if (
      checkCollisionWithBoard(updatedPiece, {
        x: updatedPiece.position.x,
        y: updatedPiece.position.y + 1,
      }, board.value)
    ) {
      lockPiece(pieceId)
    }
  }

  function checkCannotMoveDown(pieceId: PieceId): boolean {
    const piece = currentPieces.value.get(pieceId)
    if (!piece) return true

    const newPosition = {
      x: piece.position.x,
      y: piece.position.y + 1,
    }

    // Check board collision first
    if (checkCollisionWithBoard(piece, newPosition, board.value)) {
      return true
    }

    // Check if it would collide with the other piece
    const otherPieceId = pieceId === PIECE_IDS.LEFT ? PIECE_IDS.RIGHT : PIECE_IDS.LEFT
    const otherPiece = currentPieces.value.get(otherPieceId)

    if (
      otherPiece && checkCollisionBetweenPieces(
        { ...piece, position: newPosition },
        otherPiece,
      )
    ) {
      // Check if the other piece itself can move down
      const otherNewPosition = {
        x: otherPiece.position.x,
        y: otherPiece.position.y + 1,
      }
      return checkCollisionWithBoard(otherPiece, otherNewPosition, board.value)
    }

    return false
  }

  function moveAllPiecesDown() {
    if (gameOver.value || paused.value) return

    // Process each piece
    Object.values(PIECE_IDS).forEach(pieceId => {
      const piece = currentPieces.value.get(pieceId)
      if (!piece) return

      // Get piece-specific drop interval
      const intervalForPiece = getDropInterval(pieceId)

      // Increment the drop counter for this piece
      const currentCount = pieceDropCounters.value.get(pieceId) || 0
      const newCount = currentCount + GAME_LOOP_INTERVAL
      pieceDropCounters.value.set(pieceId, newCount)

      // Only move the piece down if it's time to do so based on the drop interval
      if (newCount >= intervalForPiece) {
        // Reset counter (keep remainder for more accurate timing)
        pieceDropCounters.value.set(pieceId, newCount % intervalForPiece)

        const otherPieceId = pieceId === PIECE_IDS.LEFT ? PIECE_IDS.RIGHT : PIECE_IDS.LEFT
        const otherPiece = currentPieces.value.get(otherPieceId)

        const newPosition = {
          x: piece.position.x,
          y: piece.position.y + 1,
        }

        const boardCollision = checkCollisionWithBoard(
          piece,
          newPosition,
          board.value,
        )

        const pieceCollision = checkCollisionBetweenPieces(
          { ...piece, position: newPosition },
          otherPiece,
        )

        if (!boardCollision && !pieceCollision) {
          piece.position = newPosition
        } else {
          // Only lock if it hit the board, not another piece
          if (boardCollision) {
            lockPiece(pieceId)
          }
        }
      }
    })
  }

  // Generic lock piece function
  function lockPiece(pieceId: PieceId) {
    const piece = currentPieces.value.get(pieceId)
    if (!piece) return

    // Add the piece to the board
    board.value = lockPieceToBoard(piece, board.value)

    // Check for cleared lines
    const result = clearLines(board.value, level.value)
    board.value = result.newBoard
    lines.value += result.linesCleared
    score.value += result.scoreToAdd

    // Update level based on lines cleared
    const newLevel = Math.floor(lines.value / 10) + 1
    if (newLevel !== level.value) {
      level.value = newLevel
      restartGameLoop()
    }

    // Spawn a new piece only if we're not in game over state
    if (!gameOver.value) {
      spawnPiece(pieceId)
    }
  }

  function startGameLoop() {
    if (gameLoopInterval.value) return

    // Set to run at ~60fps instead of 1ms
    gameLoopInterval.value = window.setInterval(() => {
      if (!paused.value && !gameOver.value) {
        moveAllPiecesDown()
      }
    }, GAME_LOOP_INTERVAL)
  }

  function stopGameLoop() {
    if (gameLoopInterval.value) {
      clearInterval(gameLoopInterval.value)
      gameLoopInterval.value = null
    }
  }

  function restartGameLoop() {
    stopGameLoop()
    startGameLoop()
  }

  function togglePause() {
    paused.value = !paused.value
  }

  return {
    // State
    board,
    score,
    level,
    lines,
    gameOver,
    paused,

    // Maps
    currentPieces,
    nextPieces,
    ghostPiecePositions,
    pieceDropCounters, // Export the drop counters if needed

    // Actions
    startGame,
    resetGame,
    movePiece,
    rotatePiece,
    hardDropPiece,
    togglePause,
  }
})
