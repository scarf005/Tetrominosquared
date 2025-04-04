<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useGameStore } from "@/stores/game"
import { BOARD_WIDTH } from "@/constants/tetrominos"
import { PIECE_IDS } from "@/constants/pieces"

const gameStore = useGameStore()
const boardRef = ref<HTMLDivElement | null>(null)
const cellSize = ref(25) // Default cell size

// Calculate appropriate cell size based on screen width
const calculateCellSize = () => {
  if (!boardRef.value) return

  const windowWidth = window.innerWidth
  if (windowWidth <= 320) {
    cellSize.value = 16 // Very small screens
  } else if (windowWidth <= 480) {
    cellSize.value = 20 // Small phones
  } else if (windowWidth <= 768) {
    cellSize.value = 22 // Tablets and large phones
  } else {
    cellSize.value = 25 // Desktop
  }
}

// Merge the current pieces into a visual representation of the board
const displayBoard = computed(() => {
  // Clone the board
  const boardCopy = gameStore.board.map((row) => [...row])

  // Process all pieces
  for (const [pieceId, piece] of gameStore.currentPieces.entries()) {
    if (!piece) continue

    const ghostPosition = gameStore.ghostPiecePositions.get(pieceId)
    if (!ghostPosition) continue

    // Determine if it's left or right piece for styling
    const isRightPiece = pieceId === PIECE_IDS.RIGHT
    const isLeftPiece = pieceId === PIECE_IDS.LEFT

    renderPieceAndGhost(
      boardCopy,
      piece,
      ghostPosition,
      isRightPiece,
      isLeftPiece,
    )
  }

  return boardCopy
})

function renderPieceAndGhost(
  boardCopy: any[][],
  piece: any,
  ghostPosition: any,
  isRightPiece: boolean,
  isLeftPiece: boolean,
) {
  const { shape, position, color } = piece

  // Add trail gradients between current piece and ghost piece
  if (position.y < ghostPosition.y) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const currentX = position.x + x
          const currentY = position.y + y
          const ghostY = ghostPosition.y + y

          if (ghostY - currentY > 1) {
            for (let trailY = currentY + 1; trailY < ghostY; trailY++) {
              if (
                trailY >= 0 &&
                trailY < boardCopy.length &&
                currentX >= 0 &&
                currentX < BOARD_WIDTH &&
                !boardCopy[trailY][currentX].filled
              ) {
                const distance = ghostY - currentY - 1
                const progress = (trailY - currentY) / (distance || 1)
                const opacity = Math.round((1 - progress) * 60)

                boardCopy[trailY][currentX] = {
                  filled: true,
                  color: `${color}${opacity.toString(16).padStart(2, "0")}`,
                  isTrail: true,
                }
              }
            }
          }
        }
      }
    }
  }

  // Add ghost piece
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardX = ghostPosition.x + x
        const boardY = ghostPosition.y + y

        if (
          boardY >= 0 &&
          boardY < boardCopy.length &&
          boardX >= 0 &&
          boardX < BOARD_WIDTH &&
          !boardCopy[boardY][boardX].isActive
        ) {
          boardCopy[boardY][boardX] = {
            filled: true,
            color: `${color}80`,
            isGhost: true,
          }
        }
      }
    }
  }

  // Add the current piece (last to ensure it's on top)
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardX = position.x + x
        const boardY = position.y + y

        if (
          boardY >= 0 && boardY < boardCopy.length && boardX >= 0 &&
          boardX < BOARD_WIDTH
        ) {
          boardCopy[boardY][boardX] = {
            filled: true,
            color,
            isActive: true,
            isRightPiece,
            isLeftPiece,
          }
        }
      }
    }
  }
}

onMounted(() => {
  calculateCellSize()
  window.addEventListener("resize", calculateCellSize)
})

onUnmounted(() => {
  window.removeEventListener("resize", calculateCellSize)
})
</script>

<template>
  <div class="tetris-board" ref="boardRef">
    <div
      v-for="(row, rowIndex) in displayBoard"
      :key="`row-${rowIndex}`"
      class="board-row"
    >
      <div
        v-for="(cell, cellIndex) in row"
        :key="`cell-${rowIndex}-${cellIndex}`"
        class="board-cell"
        :class='
          {
            filled: cell.filled,
            ghost: cell.isGhost,
            trail: cell.isTrail,
            active: cell.isActive,
            "right-piece": cell.isRightPiece,
            "left-piece": cell.isLeftPiece,
          }
        '
        :style='
          {
            backgroundColor: cell.filled ? cell.color : "transparent",
            width: `${cellSize}px`,
            height: `${cellSize}px`,
          }
        '
      >
      </div>
    </div>
  </div>
</template>

<style scoped>
.tetris-board {
  border: 2px solid #333;
  display: inline-block;
  background-color: #111;
}

.board-row {
  display: flex;
}

.board-cell {
  border: 1px solid #333;
  box-sizing: border-box;
}

.filled {
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.3);
}

.active {
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.5);
}

.ghost {
  border: 2px dashed rgba(255, 255, 255, 0.7);
  box-shadow: none;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.3) 0px,
    rgba(255, 255, 255, 0.3) 5px,
    transparent 5px,
    transparent 10px
  );
  background-size: 14px 14px;
}

.trail {
  border: none;
  box-shadow: none;
}

/* Different highlight colors for left and right pieces */
.left-piece {
  border: 3px solid #3498db;
  /* Blue highlight for WASD piece */
  box-shadow: 0 0 8px #3498db, inset 0 0 5px #3498db;
}

.right-piece {
  border: 3px solid #e67e22;
  /* Orange highlight for Arrow keys piece */
  box-shadow: 0 0 8px #e67e22, inset 0 0 5px #e67e22;
}

@media (max-width: 768px) {
  .tetris-board {
    border-width: 1px;
  }

  .board-cell {
    border-width: 1px;
  }

  .filled,
  .active {
    box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.3);
  }

  .left-piece,
  .right-piece {
    border-width: 2px;
  }
}
</style>
