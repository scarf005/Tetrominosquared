<script setup lang="ts">
import { useGameStore } from '@/stores/game';

const gameStore = useGameStore();
</script>

<template>
  <div class="score-board">
    <h3>Score</h3>
    <div class="score">{{ gameStore.score }}</div>

    <h3>Level</h3>
    <div class="level">{{ gameStore.level }}</div>

    <h3>Lines</h3>
    <div class="lines">{{ gameStore.lines }}</div>
  </div>
</template>

<style scoped>
.score-board {
  border: 2px solid #333;
  padding: 10px;
  margin-top: 20px;
  margin-left: 20px;
  background-color: #222;
  display: inline-block;
  vertical-align: top;
  min-width: 100px;
}

h3 {
  margin: 0;
  color: white;
}

.score, .level, .lines {
  font-size: 24px;
  margin-bottom: 15px;
  color: white;
  font-weight: bold;
}
</style>
