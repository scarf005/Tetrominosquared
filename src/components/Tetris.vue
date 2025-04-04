<script setup lang="ts">
import { onMounted, onUnmounted } from "vue"
import { useGameStore } from "@/stores/game"
import { useMobileDetection } from "@/composables/useMobileDetection.ts"
import { PIECE_IDS, PIECE_METADATA, type PieceId } from "@/constants/pieces.ts"
import Board from "./Board.vue"
import NextPiece from "./NextPiece.vue"
import ScoreBoard from "./ScoreBoard.vue"
import Controls from "./Controls.vue"

import IconGithub from "@/components/icons/IconGitHub.vue"
const gameStore = useGameStore()
const { isMobile } = useMobileDetection()

// Map from display key names to actual event.key values
const KEY_MAPPING: Record<string, string> = {
  "←": "ArrowLeft",
  "→": "ArrowRight",
  "↓": "ArrowDown",
  "↑": "ArrowUp",
  "Space": " ",
}

// Create a mapping from keyboard events to piece actions
const keyActionMap = Object.entries(PIECE_IDS).reduce((map, [_, pieceId]) => {
  const metadata = PIECE_METADATA[pieceId as PieceId]

  Object.entries(metadata.controls).forEach(([action, controlKey]) => {
    const eventKey = KEY_MAPPING[controlKey as string] ||
      (controlKey as string).toLowerCase()
    map.set(eventKey, { pieceId, action })
  })

  return map
}, new Map<string, { pieceId: PieceId; action: string }>())

function handleKeyDown(event: KeyboardEvent) {
  if (gameStore.gameOver) return

  // Special case for pause which isn't in metadata
  if (event.key.toLowerCase() === " ") {
    gameStore.togglePause()
    event.preventDefault()
    return
  }
  const key = event.key === "Shift"
    ? `${
      event.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT ? "L" : "R"
    }Shift`
    : event.key

  const keyAction = keyActionMap.get(key.toLowerCase())
  if (!keyAction) return

  const { pieceId, action } = keyAction
  event.preventDefault()

  // Execute the action based on the key mapping
  switch (action) {
    case "left":
      gameStore.movePiece(pieceId, -1, 0)
      break
    case "right":
      gameStore.movePiece(pieceId, 1, 0)
      break
    case "down":
      gameStore.movePiece(pieceId, 0, 1)
      break
    case "rotate":
      gameStore.rotatePiece(pieceId)
      break
    case "hardDrop":
      gameStore.hardDropPiece(pieceId)
      break
  }
}

// Mobile button controls
function moveLeft(pieceId: PieceId) {
  if (gameStore.gameOver || gameStore.paused) return
  gameStore.movePiece(pieceId, -1, 0)
}

function moveRight(pieceId: PieceId) {
  if (gameStore.gameOver || gameStore.paused) return
  gameStore.movePiece(pieceId, 1, 0)
}

function moveDown(pieceId: PieceId) {
  if (gameStore.gameOver || gameStore.paused) return
  gameStore.movePiece(pieceId, 0, 1)
}

function rotate(pieceId: PieceId) {
  if (gameStore.gameOver || gameStore.paused) return
  gameStore.rotatePiece(pieceId)
}

function hardDrop(pieceId: PieceId) {
  if (gameStore.gameOver || gameStore.paused) return
  gameStore.hardDropPiece(pieceId)
}

function startGame() {
  gameStore.startGame()
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown)
  // Start the game automatically when component is mounted
  startGame()
})

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown)
})
</script>

<template>
  <div class="tetris-game">
    <div class="game-container" :class='{ "mobile-layout": isMobile }'>
      <div class="board-container">
        <Board />

        <div class="mobile-controls" v-if="isMobile">
          <!-- Left piece controls -->
          <div class="control-section left-section">
            <div class="piece-label blue-text">Blue Piece</div>
            <div class="direction-buttons">
              <button
                class="control-btn rotate-btn"
                @click="rotate(PIECE_IDS.LEFT)"
              >
                ↻
              </button>
              <button class="control-btn" @click="moveLeft(PIECE_IDS.LEFT)">
                ←
              </button>
              <button class="control-btn" @click="moveDown(PIECE_IDS.LEFT)">
                ↓
              </button>
              <button class="control-btn" @click="moveRight(PIECE_IDS.LEFT)">
                →
              </button>
              <button
                class="control-btn hard-drop-btn blue-btn"
                @click="hardDrop(PIECE_IDS.LEFT)"
              >
                ⬇︎
              </button>
            </div>
          </div>

          <!-- Right piece controls -->
          <div class="control-section right-section">
            <div class="piece-label orange-text">Orange Piece</div>
            <div class="direction-buttons">
              <button
                class="control-btn rotate-btn"
                @click="rotate(PIECE_IDS.RIGHT)"
              >
                ↻
              </button>
              <button class="control-btn" @click="moveLeft(PIECE_IDS.RIGHT)">
                ←
              </button>
              <button class="control-btn" @click="moveDown(PIECE_IDS.RIGHT)">
                ↓
              </button>
              <button class="control-btn" @click="moveRight(PIECE_IDS.RIGHT)">
                →
              </button>
              <button
                class="control-btn hard-drop-btn orange-btn"
                @click="hardDrop(PIECE_IDS.RIGHT)"
              >
                ⬇︎
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="side-panel">
        <NextPiece />
        <ScoreBoard />
        <div class="controls">
          <button
            class="btn"
            @click="startGame"
            :disabled="!gameStore.gameOver && !gameStore.paused"
          >
            {{ gameStore.gameOver ? "New Game" : "Restart" }}
          </button>
          <button
            class="btn"
            @click="gameStore.togglePause"
            :disabled="gameStore.gameOver"
          >
            {{ gameStore.paused ? "Resume" : "Pause" }}
          </button>
        </div>
        <a
          href="https://github.com/scarf005/Tetrominosquared"
          target="_blank"
          rel="noopener"
          class="github-link"
        >
          <IconGithub />
          <span>View on GitHub</span>
        </a>
      </div>
    </div>

    <div class="game-status" v-if="gameStore.gameOver || gameStore.paused">
      <div class="status-message" v-if="gameStore.gameOver">Game Over</div>
      <div class="status-message" v-else-if="gameStore.paused">Paused</div>
    </div>

    <div class="keyboard-controls" v-if="!isMobile">
      <h3>Dual-Hand Controls</h3>
      <div class="controls-container">
        <div class="left-controls">
          <h4>Left Piece (Blue)</h4>
          <Controls :pieceId="PIECE_IDS.LEFT" />
        </div>
        <div class="right-controls">
          <h4>Right Piece (Orange)</h4>
          <Controls :pieceId="PIECE_IDS.RIGHT" />
        </div>
      </div>
      <div class="shared-controls">
        <li><strong>P:</strong> Pause</li>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tetris-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px auto;
  position: relative;
  width: 100%;
  max-width: 800px;
}

.game-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.mobile-layout {
  flex-direction: column;
  align-items: center;
}

.board-container {
  display: flex;
  flex-direction: column;
}

.side-panel {
  display: flex;
  flex-direction: column;
}

.controls {
  margin-top: 20px;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  padding: 10px;
  font-size: 16px;
  background-color: #333;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.btn:hover:not(:disabled) {
  background-color: #444;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  padding: 20px 40px;
  border-radius: 10px;
  z-index: 10;
}

.status-message {
  font-size: 32px;
  font-weight: bold;
  color: white;
  text-align: center;
}

.keyboard-controls {
  margin-top: 20px;
  color: white;
  text-align: left;
  width: 100%;
  max-width: 400px;
}

h3 {
  color: white;
  margin-bottom: 5px;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin-bottom: 5px;
}

.controls-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 10px;
}

.left-controls,
.right-controls {
  width: 48%;
}

.left-controls h4 {
  color: #3498db;
}

.right-controls h4 {
  color: #e67e22;
}

.shared-controls {
  margin-top: 10px;
  border-top: 1px solid #444;
  padding-top: 10px;
}

h4 {
  margin: 0 0 5px;
}

.github-link {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  margin-left: 20px;
  color: #aaa;
  text-decoration: none;
  font-size: 14px;
}

.github-link:hover {
  color: white;
}

/* Mobile controls with buttons instead of swipe */
.mobile-controls {
  display: flex;
  width: 100%;
  margin-top: 15px;
  gap: 15px;
  padding: 10px 0;
}

.control-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.piece-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.blue-text {
  color: #3498db;
}

.orange-text {
  color: #e67e22;
}

.direction-buttons {
  display: grid;
  grid-template-areas:
    ".  rotate  ."
    "left down right"
    ".  drop   .";
  grid-gap: 5px;
}

.control-btn {
  width: 50px;
  height: 50px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.control-btn:active {
  background-color: #555;
  transform: scale(0.95);
}

.rotate-btn {
  grid-area: rotate;
}

.hard-drop-btn {
  grid-area: drop;
  font-size: 28px;
  font-weight: bold;
}

.blue-btn {
  background-color: #2980b9;
}

.orange-btn {
  background-color: #d35400;
}

.direction-buttons button:nth-child(2) {
  grid-area: left;
}

.direction-buttons button:nth-child(3) {
  grid-area: down;
}

.direction-buttons button:nth-child(4) {
  grid-area: right;
}

.direction-buttons button:nth-child(5) {
  grid-area: drop;
}

@media (max-width: 768px) {
  .tetris-game {
    margin: 10px auto;
  }

  .side-panel {
    margin-top: 15px;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .controls {
    margin: 15px 10px;
    flex-direction: row;
  }

  .btn {
    margin: 0 5px;
    font-size: 14px;
    padding: 8px 12px;
  }

  .github-link {
    width: 100%;
    justify-content: center;
    margin: 15px 0;
  }

  .status-message {
    font-size: 24px;
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .mobile-controls {
    gap: 5px;
  }

  .control-btn {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .hard-drop-btn {
    font-size: 24px;
  }
}
</style>
