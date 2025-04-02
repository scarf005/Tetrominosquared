<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { useMobileDetection } from '@/composables/useMobileDetection.ts'
import Board from './Board.vue'
import NextPiece from './NextPiece.vue'
import ScoreBoard from './ScoreBoard.vue'
import IconGithub from "@/components/icons/IconGitHub.vue"

const gameStore = useGameStore()
const { isMobile } = useMobileDetection()

function handleKeyDown(event: KeyboardEvent) {
    if (gameStore.gameOver) return

    // Left hand controls for left piece (WASD)
    switch (event.key.toLowerCase()) {
        case 'a':
            gameStore.movePiece1(-1, 0)
            event.preventDefault()
            break
        case 'd':
            gameStore.movePiece1(1, 0)
            event.preventDefault()
            break
        case 's':
            gameStore.movePiece1(0, 1)
            event.preventDefault()
            break
        case 'w':
            gameStore.rotatePiece1()
            event.preventDefault()
            break
        case 'q':
            gameStore.hardDropPiece1()
            event.preventDefault()
            break
        case 'p':
            gameStore.togglePause()
            event.preventDefault()
            break
    }

    // Right hand controls for right piece (Arrow keys)
    switch (event.key) {
        case 'ArrowLeft':
            gameStore.movePiece2(-1, 0)
            event.preventDefault()
            break
        case 'ArrowRight':
            gameStore.movePiece2(1, 0)
            event.preventDefault()
            break
        case 'ArrowDown':
            gameStore.movePiece2(0, 1)
            event.preventDefault()
            break
        case 'ArrowUp':
            gameStore.rotatePiece2()
            event.preventDefault()
            break
        case ' ': // Space
            gameStore.hardDropPiece2()
            event.preventDefault()
            break
    }
}

// Mobile button controls
function moveLeft(piece: 'left' | 'right') {
    if (gameStore.gameOver || gameStore.paused) return
    if (piece === 'left') {
        gameStore.movePiece1(-1, 0)
    } else {
        gameStore.movePiece2(-1, 0)
    }
}

function moveRight(piece: 'left' | 'right') {
    if (gameStore.gameOver || gameStore.paused) return
    if (piece === 'left') {
        gameStore.movePiece1(1, 0)
    } else {
        gameStore.movePiece2(1, 0)
    }
}

function moveDown(piece: 'left' | 'right') {
    if (gameStore.gameOver || gameStore.paused) return
    if (piece === 'left') {
        gameStore.movePiece1(0, 1)
    } else {
        gameStore.movePiece2(0, 1)
    }
}

function rotate(piece: 'left' | 'right') {
    if (gameStore.gameOver || gameStore.paused) return
    if (piece === 'left') {
        gameStore.rotatePiece1()
    } else {
        gameStore.rotatePiece2()
    }
}

function hardDrop(piece: 'left' | 'right') {
    if (gameStore.gameOver || gameStore.paused) return
    if (piece === 'left') {
        gameStore.hardDropPiece1()
    } else {
        gameStore.hardDropPiece2()
    }
}

function startGame() {
    gameStore.startGame()
}

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    // Start the game automatically when component is mounted
    startGame();
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
    <div class="tetris-game">
        <div class="game-container" :class="{ 'mobile-layout': isMobile }">
            <div class="board-container">
                <Board />

                <div class="mobile-controls" v-if="isMobile">
                    <!-- Left piece controls -->
                    <div class="control-section left-section">
                        <div class="piece-label blue-text">Blue Piece</div>
                        <div class="direction-buttons">
                            <button class="control-btn rotate-btn" @click="rotate('left')">↻</button>
                            <button class="control-btn" @click="moveLeft('left')">←</button>
                            <button class="control-btn" @click="moveDown('left')">↓</button>
                            <button class="control-btn" @click="moveRight('left')">→</button>
                            <button class="control-btn hard-drop-btn blue-btn" @click="hardDrop('left')">⬇︎</button>
                        </div>
                    </div>

                    <!-- Right piece controls -->
                    <div class="control-section right-section">
                        <div class="piece-label orange-text">Orange Piece</div>
                        <div class="direction-buttons">
                            <button class="control-btn rotate-btn" @click="rotate('right')">↻</button>
                            <button class="control-btn" @click="moveLeft('right')">←</button>
                            <button class="control-btn" @click="moveDown('right')">↓</button>
                            <button class="control-btn" @click="moveRight('right')">→</button>
                            <button class="control-btn hard-drop-btn orange-btn" @click="hardDrop('right')">⬇︎</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="side-panel">
                <NextPiece />
                <ScoreBoard />
                <div class="controls">
                    <button class="btn" @click="startGame" :disabled="!gameStore.gameOver && !gameStore.paused">
                        {{ gameStore.gameOver ? 'New Game' : 'Restart' }}
                    </button>
                    <button class="btn" @click="gameStore.togglePause" :disabled="gameStore.gameOver">
                        {{ gameStore.paused ? 'Resume' : 'Pause' }}
                    </button>
                </div>
                <a href="https://github.com/scarf005/Tetrominosquared" target="_blank" rel="noopener"
                    class="github-link">
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
                    <ul>
                        <li><strong>A/D:</strong> Move left/right</li>
                        <li><strong>S:</strong> Soft drop</li>
                        <li><strong>W:</strong> Rotate</li>
                        <li><strong>Q:</strong> Hard drop</li>
                    </ul>
                </div>
                <div class="right-controls">
                    <h4>Right Piece (Orange)</h4>
                    <ul>
                        <li><strong>←/→:</strong> Move left/right</li>
                        <li><strong>↓:</strong> Soft drop</li>
                        <li><strong>↑:</strong> Rotate</li>
                        <li><strong>Space:</strong> Hard drop</li>
                    </ul>
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
