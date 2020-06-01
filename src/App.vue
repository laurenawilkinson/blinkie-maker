<template>
<div :class="{ main: true, dragging }" @click="onItemMouseUp">
  <div class="container container--main">
    <h1>blinkie maker!</h1>
    <button type="button" @click="saveCanvas">Save Current Frame</button>
    <button type="button" @click="saveAsGif">Save As Gif</button>
    <button type="button" @click="previewGif">Preview Gif</button>
    <img v-for="(image, i) in images" :key="i" :src="image" />
    <div class="content-container">
      <blinkie-items @item-mouse-down="onItemMouseDown" @item-mouse-move="onItemMouseMove" />
      <blinkie-canvas v-bind="{ grid, currentItem, dragging, activeFrame, frames }" :images.sync="images" ref="blinkieCanvas" />
      <blinkie-frames v-model="activeFrame" :frames.sync="frames" />
    </div>
  </div>
  <footer>
    <div class="container">
      Made by <a href="https://github.com/laurenawilkinson">laurenawilkinson</a> on github!
    </div>
  </footer>
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
      frames: [ 1 ],
      images: []
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
      if (!this.dragging) return;
      this.dragStart = false;
      this.dragging = false;
      this.currentItem = null;
    },
    saveCanvas () {
      this.$refs.blinkieCanvas.saveCanvas();
    },
    saveAsGif () {
      this.$refs.blinkieCanvas.saveAsGif();
    },
    previewGif () {
      
    }
  }
}
</script>