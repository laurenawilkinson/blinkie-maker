<template>
  <div class="canvas__container">
    <canvas-layer 
      v-for="frame in frames"
      :key="frame"
      v-show="frame == activeFrame"
      v-bind="{ grid, currentItem, dragging, frame }" />
  </div>
</template>

<script>
import CanvasLayer from './CanvasLayer.vue';
export default {
  name: 'BlinkieCanvas',
  components: {
    CanvasLayer
  },
  props: {
    grid: Number,
    currentItem: Object | null,
    dragging: Boolean,
    activeFrame: Number,
    frames: Array
  }
}
</script>