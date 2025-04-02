<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { useMobileDetection } from '@/composables/useMobileDetection.ts'

const gameStore = useGameStore();
const { isMobile } = useMobileDetection();
const cellSize = ref(20);

const nextPiece1Display = computed(() => {
    if (!gameStore.nextPiece1) return [];
    return gameStore.nextPiece1.shape;
});

const nextPiece2Display = computed(() => {
    if (!gameStore.nextPiece2) return [];
    return gameStore.nextPiece2.shape;
});

// Update cell size when mobile status changes
function updateCellSize() {
    cellSize.value = isMobile.value ? 16 : 20;
}

// Watch for mobile changes to update cell size
watch(isMobile, updateCellSize, { immediate: true });
</script>

<template>
    <div class="next-pieces" :class="{ 'mobile-layout': isMobile }">
        <div class="next-piece left-piece">
            <h3>Next <span class="blue-text">Blue</span></h3>
            <div class="piece-preview">
                <div v-for="(row, rowIndex) in nextPiece1Display" :key="`row1-${rowIndex}`" class="preview-row">
                    <div v-for="(cell, cellIndex) in row" :key="`cell1-${rowIndex}-${cellIndex}`" class="preview-cell"
                        :class="{ filled: cell, 'left-preview': cell }" :style="{
                            backgroundColor: cell ? gameStore.nextPiece1?.color : 'transparent',
                            width: `${cellSize}px`,
                            height: `${cellSize}px`
                        }"></div>
                </div>
            </div>
        </div>

        <div class="next-piece right-piece">
            <h3>Next <span class="orange-text">Orange</span></h3>
            <div class="piece-preview">
                <div v-for="(row, rowIndex) in nextPiece2Display" :key="`row2-${rowIndex}`" class="preview-row">
                    <div v-for="(cell, cellIndex) in row" :key="`cell2-${rowIndex}-${cellIndex}`" class="preview-cell"
                        :class="{ filled: cell, 'right-preview': cell }" :style="{
                            backgroundColor: cell ? gameStore.nextPiece2?.color : 'transparent',
                            width: `${cellSize}px`,
                            height: `${cellSize}px`
                        }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.next-pieces {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-left: 20px;
}

.mobile-layout {
    flex-direction: row;
    margin-left: 0;
    gap: 5px;
}

.next-piece {
    border: 2px solid #333;
    padding: 10px;
    background-color: #222;
    display: inline-block;
    vertical-align: top;
    width: 100%;
}

.piece-preview {
    margin-top: 10px;
    display: inline-block;
}

.preview-row {
    display: flex;
}

.preview-cell {
    border: 1px solid #333;
    box-sizing: border-box;
}

.filled {
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.3);
}

.left-preview {
    border: 1px solid rgba(52, 152, 219, 0.7);
    box-shadow: inset 0 0 5px rgba(52, 152, 219, 0.5);
}

.right-preview {
    border: 1px solid rgba(230, 126, 34, 0.7);
    box-shadow: inset 0 0 5px rgba(230, 126, 34, 0.5);
}

h3 {
    margin: 0 0 10px;
    color: white;
    text-align: center;
}

.blue-text {
    color: #3498db;
}

.orange-text {
    color: #e67e22;
}

@media (max-width: 768px) {
    .next-piece {
        border-width: 1px;
        padding: 5px;
    }

    h3 {
        font-size: 14px;
        margin-bottom: 5px;
    }

    .piece-preview {
        margin-top: 5px;
    }

    .filled {
        box-shadow: inset 0 0 2px rgba(255, 255, 255, 0.3);
    }
}
</style>
