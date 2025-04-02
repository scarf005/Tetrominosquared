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

export const useGameStore = defineStore("game", () => {
  // State
  const board = ref<Cell[][]>(createEmptyBoard())
  const currentPiece1 = ref<Tetromino | null>(null) // Left piece (WASD controls)
  const currentPiece2 = ref<Tetromino | null>(null) // Right piece (Arrow keys)
  const nextPiece1 = ref<Tetromino | null>(null) // Next piece for left
  const nextPiece2 = ref<Tetromino | null>(null) // Next piece for right
  const score = ref(0)
  const level = ref(1)
  const lines = ref(0)
  const gameOver = ref(false)
  const paused = ref(false)
  const gameLoopInterval = ref<number | null>(null)

  // Getters
  const dropInterval = computed(() => Math.max(100, 1000 - level.value * 100))

  // Calculate ghost piece positions for both pieces
  const ghostPiecePosition1 = computed(() => {
    if (!currentPiece1.value) return null
    return calculateGhostPosition(
      currentPiece1.value,
      currentPiece2.value,
      board.value,
    )
  })

  const ghostPiecePosition2 = computed(() => {
    if (!currentPiece2.value) return null
    return calculateGhostPosition(
      currentPiece2.value,
      currentPiece1.value,
      board.value,
    )
  })

  // Actions
  function createRandomPiece(offsetX = 0): Tetromino {
    const types: TetrominoType[] = ["I", "J", "L", "O", "S", "T", "Z"]
    const type = types[Math.floor(Math.random() * types.length)]

    return {
      type,
      shape: TETROMINO_SHAPES[type],
      color: TETROMINO_COLORS[type],
      position: {
        x: Math.floor(BOARD_WIDTH / 2) -
          Math.floor(TETROMINO_SHAPES[type][0].length / 2) + offsetX,
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
    nextPiece1.value = createRandomPiece(-3)
    nextPiece2.value = createRandomPiece(3)

    // Spawn the initial pieces
    spawnPiece1()
    spawnPiece2()

    startGameLoop()
  }

  function resetGame() {
    board.value = createEmptyBoard()
    currentPiece1.value = null
    currentPiece2.value = null
    nextPiece1.value = null
    nextPiece2.value = null
    score.value = 0
    level.value = 1
    lines.value = 0
    stopGameLoop()
  }

  // Spawn piece 1 (left) with collision check
  function spawnPiece1() {
    if (!nextPiece1.value) {
      nextPiece1.value = createRandomPiece(-3)
    }

    currentPiece1.value = nextPiece1.value
    nextPiece1.value = createRandomPiece(-3)

    // Ensure new piece doesn't overlap with existing piece 2
    if (
      currentPiece2.value &&
      checkCollisionBetweenPieces(currentPiece1.value, currentPiece2.value)
    ) {
      // Try to adjust horizontally if there's overlap
      if (currentPiece1.value.position.x > BOARD_WIDTH / 2) {
        currentPiece1.value.position.x -= 2
      } else {
        currentPiece1.value.position.x -= 3
      }
    }

    // Only check for game over if the piece collides with the board,
    // not if it collides with the other piece (which might be anywhere on the board)
    if (
      checkCollisionWithBoard(
        currentPiece1.value,
        currentPiece1.value.position,
        board.value,
      )
    ) {
      gameOver.value = true
      stopGameLoop()
    }
  }

  // Spawn piece 2 (right) with collision check
  function spawnPiece2() {
    if (!nextPiece2.value) {
      nextPiece2.value = createRandomPiece(3)
    }

    currentPiece2.value = nextPiece2.value
    nextPiece2.value = createRandomPiece(3)

    // Ensure new piece doesn't overlap with existing piece 1
    if (
      currentPiece1.value &&
      checkCollisionBetweenPieces(currentPiece2.value, currentPiece1.value)
    ) {
      // Try to adjust horizontally if there's overlap
      if (currentPiece2.value.position.x < BOARD_WIDTH / 2) {
        currentPiece2.value.position.x += 2
      } else {
        currentPiece2.value.position.x += 3
      }
    }

    // Only check for game over if the piece collides with the board,
    // not if it collides with the other piece (which might be anywhere on the board)
    if (
      checkCollisionWithBoard(
        currentPiece2.value,
        currentPiece2.value.position,
        board.value,
      )
    ) {
      gameOver.value = true
      stopGameLoop()
    }
  }

  // Functions to control piece 1 (left hand - WASD)
  function movePiece1(dx: number, dy: number) {
    if (gameOver.value || paused.value || !currentPiece1.value) return

    const newPosition: Position = {
      x: currentPiece1.value.position.x + dx,
      y: currentPiece1.value.position.y + dy,
    }

    // Check collision with board and other piece
    const boardCollision = checkCollisionWithBoard(
      currentPiece1.value,
      newPosition,
      board.value,
    )
    const pieceCollision = checkCollisionBetweenPieces({
      ...currentPiece1.value,
      position: newPosition,
    }, currentPiece2.value)

    if (!boardCollision && !pieceCollision) {
      // If no collision, just move the piece
      currentPiece1.value.position = newPosition
    } else if (dy > 0) {
      // If collision happened during downward movement,
      // only lock if it hit the board, NOT if it hit the other piece
      if (boardCollision) {
        lockPiece1()
      }
      // If it hit the other piece, don't lock - it's not "landed"
    }
  }

  function rotatePiece1() {
    if (!currentPiece1.value || gameOver.value || paused.value) return
    tryRotatePiece(currentPiece1, currentPiece2.value)
  }

  function hardDropPiece1() {
    if (gameOver.value || paused.value || !currentPiece1.value) return
    performHardDrop(currentPiece1, currentPiece2.value)
  }

  // Functions to control piece 2 (right hand - Arrow keys)
  function movePiece2(dx: number, dy: number) {
    if (gameOver.value || paused.value || !currentPiece2.value) return

    const newPosition: Position = {
      x: currentPiece2.value.position.x + dx,
      y: currentPiece2.value.position.y + dy,
    }

    // Check collision with board and other piece
    const boardCollision = checkCollisionWithBoard(
      currentPiece2.value,
      newPosition,
      board.value,
    )
    const pieceCollision = checkCollisionBetweenPieces({
      ...currentPiece2.value,
      position: newPosition,
    }, currentPiece1.value)

    if (!boardCollision && !pieceCollision) {
      // If no collision, just move the piece
      currentPiece2.value.position = newPosition
    } else if (dy > 0) {
      // If collision happened during downward movement,
      // only lock if it hit the board, NOT if it hit the other piece
      if (boardCollision) {
        lockPiece2()
      }
      // If it hit the other piece, don't lock - it's not "landed"
    }
  }

  function rotatePiece2() {
    if (!currentPiece2.value || gameOver.value || paused.value) return
    tryRotatePiece(currentPiece2, currentPiece1.value)
  }

  function hardDropPiece2() {
    if (gameOver.value || paused.value || !currentPiece2.value) return
    performHardDrop(currentPiece2, currentPiece1.value)
  }

  // Helper for rotation
  function tryRotatePiece(
    pieceRef: typeof currentPiece1 | typeof currentPiece2,
    otherPiece: Tetromino | null,
  ) {
    const piece = pieceRef.value
    if (!piece) return

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
        pieceRef.value = {
          ...newPiece,
          position: testPosition,
        }
        return // Exit after finding a valid position
      }
    }
    // If we got here, no valid rotation position was found
  }

  // Helper for hard drop
  function performHardDrop(
    pieceRef: typeof currentPiece1 | typeof currentPiece2,
    otherPiece: Tetromino | null,
  ) {
    const piece = pieceRef.value
    if (!piece) return

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

    // Apply the drop - add null check to ensure pieceRef.value exists
    if (pieceRef.value) {
      pieceRef.value.position.y = dropY

      // For hard drops, we only lock if it's hitting the board, not another piece
      if (
        checkCollisionWithBoard(piece, {
          x: piece.position.x,
          y: piece.position.y + 1,
        }, board.value)
      ) {
        if (pieceRef === currentPiece1) {
          lockPiece1()
        } else {
          lockPiece2()
        }
      }
    }
  }

  function checkCannotMoveDown(piece: Tetromino | null): boolean {
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
    const otherPiece = piece === currentPiece1.value
      ? currentPiece2.value
      : currentPiece1.value
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

    // Try to move piece 1 down
    if (currentPiece1.value) {
      const newPosition1 = {
        x: currentPiece1.value.position.x,
        y: currentPiece1.value.position.y + 1,
      }

      const boardCollision1 = checkCollisionWithBoard(
        currentPiece1.value,
        newPosition1,
        board.value,
      )
      const pieceCollision1 = checkCollisionBetweenPieces({
        ...currentPiece1.value,
        position: newPosition1,
      }, currentPiece2.value)

      if (!boardCollision1 && !pieceCollision1) {
        currentPiece1.value.position = newPosition1
      } else {
        // Only lock if it hit the board, not another piece
        if (boardCollision1) {
          lockPiece1()
        }
      }
    }

    // Try to move piece 2 down
    if (currentPiece2.value) {
      const newPosition2 = {
        x: currentPiece2.value.position.x,
        y: currentPiece2.value.position.y + 1,
      }

      const boardCollision2 = checkCollisionWithBoard(
        currentPiece2.value,
        newPosition2,
        board.value,
      )
      const pieceCollision2 = checkCollisionBetweenPieces({
        ...currentPiece2.value,
        position: newPosition2,
      }, currentPiece1.value)

      if (!boardCollision2 && !pieceCollision2) {
        currentPiece2.value.position = newPosition2
      } else {
        // Only lock if it hit the board, not another piece
        if (boardCollision2) {
          lockPiece2()
        }
      }
    }
  }

  // Lock piece 1 and spawn a new one
  function lockPiece1() {
    if (!currentPiece1.value) return

    // Add the piece to the board
    board.value = lockPieceToBoard(currentPiece1.value, board.value)

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

    // Spawn a new piece 1 only if we're not in game over state
    if (!gameOver.value) {
      spawnPiece1()
    }
  }

  // Lock piece 2 and spawn a new one
  function lockPiece2() {
    if (!currentPiece2.value) return

    // Add the piece to the board
    board.value = lockPieceToBoard(currentPiece2.value, board.value)

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

    // Spawn a new piece 2 only if we're not in game over state
    if (!gameOver.value) {
      spawnPiece2()
    }
  }

  function startGameLoop() {
    if (gameLoopInterval.value) return

    gameLoopInterval.value = window.setInterval(() => {
      if (!paused.value && !gameOver.value) {
        moveAllPiecesDown()
      }
    }, dropInterval.value)
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
    board,
    currentPiece1,
    currentPiece2,
    nextPiece1,
    nextPiece2,
    score,
    level,
    lines,
    gameOver,
    paused,
    ghostPiecePosition1,
    ghostPiecePosition2,
    startGame,
    resetGame,
    movePiece1,
    movePiece2,
    rotatePiece1,
    rotatePiece2,
    hardDropPiece1,
    hardDropPiece2,
    togglePause,
  }
})
