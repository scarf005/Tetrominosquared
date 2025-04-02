<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { ref, onMounted, onUnmounted } from 'vue';

const gameStore = useGameStore();
const isMobile = ref(window.innerWidth <= 768);

function checkMobile() {
    isMobile.value = window.innerWidth <= 768;
}

onMounted(() => {
    window.addEventListener('resize', checkMobile);
    checkMobile();
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
});
</script>

<template>
  <div class="score-board" :class="{ 'mobile-layout': isMobile }">
    <div class="score-item">
      <h3>Score</h3>
      <div class="score">{{ gameStore.score }}</div>
    </div>

    <div class="score-item">
      <h3>Level</h3>
      <div class="level">{{ gameStore.level }}</div>
    </div>

    <div class="score-item">
      <h3>Lines</h3>
      <div class="lines">{{ gameStore.lines }}</div>
    </div>
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

.mobile-layout {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  padding: 8px;
  border-width: 1px;
  width: 100%;
  margin-left: 0;
}

.score-item {
  margin-bottom: 15px;
}

.mobile-layout .score-item {
  margin-bottom: 0;
  text-align: center;
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

.mobile-layout .score,
.mobile-layout .level,
.mobile-layout .lines {
  font-size: 18px;
  margin-bottom: 0;
}

@media (max-width: 480px) {
  .score-board {
    padding: 5px;
  }

  h3 {
    font-size: 14px;
  }

  .score, .level, .lines {
    font-size: 16px;
  }
}
</style>
