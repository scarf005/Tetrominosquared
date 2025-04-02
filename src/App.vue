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
    touch-action: manipulation;
    overflow-x: hidden;
}

main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
    max-width: 100vw;
}

h1 {
    color: white;
    margin-bottom: 20px;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    text-align: center;
}

@media (max-width: 768px) {
    main {
        padding: 5px;
    }

    h1 {
        margin-bottom: 10px;
    }
}
</style>
