<template>
  <div class="canvas__container">
    <canvas-layer 
      v-for="frame in frames"
      :key="frame"
      ref="frames"
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
  },
  methods: {
    saveCanvas () {
      const index = this.$refs.frames.findIndex(x => x.frame === this.activeFrame);
      if (index < 0) return;

      console.log(index);
      console.log(this.$refs.frames[index].canvas)
      this.$refs.frames[index].canvas.toDataURL();
    }
  }
}
</script>