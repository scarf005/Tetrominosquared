<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/game';
import Board from './Board.vue';
import NextPiece from './NextPiece.vue';
import ScoreBoard from './ScoreBoard.vue'
import IconGithub from "@/components/icons/IconGitHub.vue"

const gameStore = useGameStore();

function handleKeyDown(event: KeyboardEvent) {
    if (gameStore.gameOver) return;

    // Left hand controls for left piece (WASD)
    switch (event.key.toLowerCase()) {
        case 'a':
            gameStore.movePiece1(-1, 0);
            event.preventDefault();
            break;
        case 'd':
            gameStore.movePiece1(1, 0);
            event.preventDefault();
            break;
        case 's':
            gameStore.movePiece1(0, 1);
            event.preventDefault();
            break;
        case 'w':
            gameStore.rotatePiece1();
            event.preventDefault();
            break;
        case 'q':
            gameStore.hardDropPiece1();
            event.preventDefault();
            break;
        case 'p':
            gameStore.togglePause();
            event.preventDefault();
            break;
    }

    // Right hand controls for right piece (Arrow keys)
    switch (event.key) {
        case 'ArrowLeft':
            gameStore.movePiece2(-1, 0);
            event.preventDefault();
            break;
        case 'ArrowRight':
            gameStore.movePiece2(1, 0);
            event.preventDefault();
            break;
        case 'ArrowDown':
            gameStore.movePiece2(0, 1);
            event.preventDefault();
            break;
        case 'ArrowUp':
            gameStore.rotatePiece2();
            event.preventDefault();
            break;
        case ' ': // Space
            gameStore.hardDropPiece2();
            event.preventDefault();
            break;
    }
}

function startGame() {
    gameStore.startGame();
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
        <div class="game-container">
            <Board />
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

        <div class="keyboard-controls">
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
}

.game-container {
    display: flex;
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
</style>
