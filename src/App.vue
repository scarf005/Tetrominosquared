<script setup lang="ts">
import Tetris from './components/Tetris.vue';
</script>

<template>
    <main>
        <h1>Tetronomios²</h1>
        <Tetris />
    </main>
</template>

<style>
body {
    margin: 0;
    background-color: #121212;
    color: white;
    font-family: 'Arial', sans-serif;
}

main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
}

h1 {
    color: white;
    margin-bottom: 20px;
}
</style>
