<template>
<div :class="{ main: true, dragging }" @click="onItemMouseUp">
  <div class="container">
    <h1>blinkie maker!</h1>
    <div class="content-container">
      <blinkie-items @item-mouse-down="onItemMouseDown" @item-mouse-move="onItemMouseMove" />
      <blinkie-canvas v-bind="{ grid, currentItem, dragging, activeFrame, frames }" />
      <blinkie-frames v-model="activeFrame" :frames.sync="frames" />
    </div>
  </div>
</div>
</template>

<script>
import BlinkieItems from './components/BlinkieItems.vue';
import BlinkieFrames from './components/BlinkieFrames.vue';
import BlinkieCanvas from './components/BlinkieCanvas.vue';

export default {
  name: 'App',
  components: {
    BlinkieItems,
    BlinkieFrames,
    BlinkieCanvas
  },
  data () {
    return {
      grid: 25,
      currentItem: null,
      currentItemObj: null,
      dragging: false,
      dragStart: false,
      activeFrame: 1,
      frames: [ 1 ]
    }
  },
  methods: {
    onItemMouseDown () {
      this.dragStart = true;
    },
    onItemMouseMove (item = null) {
      if (!this.dragStart || item == null) return;
      if (this.currentItem == null) {
        this.dragging = true;
        this.currentItem = item;
        // create image ghost here
      }
    },
    onItemMouseUp () {
      this.dragStart = false;
      this.dragging = false;
      this.currentItem = null;
    }    
  }
}
</script>