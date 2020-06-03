<template>
<div :class="{ main: true, dragging }" @click="onItemMouseUp">
  <div class="container container--main">
    <header class="header">
      <div class="header__text">
        <h1>blinkie maker!</h1>
        <p class="description">An old-school blinkie maker. Drag the objects from the left onto the grid to create a scene, then add more scenes to create a blinking gif!</p>
      </div>
      <div class="header__preview">
        Preview
      </div>
    </header>
    <section class="content-container">
      <blinkie-items v-bind="{ grid }" @item-mouse-down="onItemMouseDown" @item-mouse-move="onItemMouseMove" />
      <blinkie-canvas v-bind="{ grid, currentItem, dragging, activeFrame, frames }" :images.sync="images" ref="blinkieCanvas" />
      <blinkie-frames v-model="activeFrame" :frames.sync="frames" />
    </section>
    <div class="alert">
      <p>Export your blinkie!</p>
      <button type="button" @click="saveCanvas">Save Current Frame</button>
      <button type="button" @click="saveAsGif">Save As Gif</button>
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