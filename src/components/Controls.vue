<script setup lang="ts">
import { PIECE_METADATA, type PieceId } from "@/constants/pieces.ts"

const { pieceId } = defineProps<{ pieceId: PieceId }>()
const { left, right, down, rotate, hardDrop } = PIECE_METADATA[pieceId].controls
</script>

<template>
  <ul>
    <li><strong>{{ left }}/{{ right }}</strong> Move left/right</li>
    <li><strong>{{ down }}</strong> Soft drop</li>
    <li><strong>{{ rotate }}</strong> Rotate</li>
    <li><strong>{{ hardDrop }}</strong> Hard drop</li>
  </ul>
</template>
