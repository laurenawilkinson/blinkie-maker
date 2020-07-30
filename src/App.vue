<template>
<div :class="{ main: true, dragging }" @click="onItemMouseUp">
  <div class="container container--main" ref="container">
    <header class="header">
      <div class="header__text">
        <h1>
          <span
            v-for="(letter, i) in blinkieHeader"
            :key="i" 
            :style="{
              'animation-delay': i / 4 + 's',
              'animation-duration': blinkieHeader.length / 4 + 's'
            }"
            class="blinkie-block">
            {{ letter }}
          </span>
        </h1>
        <img 
          id="info" 
          src="../static/assets/icons/info.png" 
          alt="Info"
          title="info"
          @click="openInfoPrompt = true" />
      </div>
    </header>
    <section class="content-container">
      <blinkie-items v-bind="{ grid }" @item-mouse-down="onItemMouseDown" @item-mouse-move="onItemMouseMove" />
      <blinkie-canvas 
        v-bind="{ grid, currentItem, dragging, activeFrame, frames }" 
        :images.sync="images" 
        ref="blinkieCanvas"
        @gif-loading="gifLoading = $event"
        @remove-ghost-image="removeGhostImage" />
      <blinkie-frames 
        v-model="activeFrame" 
        :frames.sync="frames"
        @duplicate-frame="duplicateFrame" />
    </section>
    <div class="alert">
      <p>Export your blinkie!</p>
      <button type="button" @click="saveCanvas">Save Current Frame</button>
      <button type="button" @click="saveAsGif">
        <img v-if="gifLoading" class="loading" src="../static/assets/icons/loading.png" />
        <span v-else>Save As Gif</span>
      </button>
    </div>
  </div>
  <footer>
    <div class="container">
      Made by <a href="https://github.com/laurenawilkinson">laurenawilkinson</a> on github!
    </div>
  </footer>
  <div v-if="openInfoPrompt" class="overlay" @click="openInfoPrompt = false">
    <div class="box-container">
      <p class="description">An old-school blinkie maker. Drag the objects from the left onto the grid to create a frame, then add more frames to create a blinking gif!</p>
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
      currentGhostImg: null,
      dragging: false,
      dragStart: false,
      activeFrame: 1,
      frames: [ 1 ],
      images: [],
      gifLoading: false,
      openInfoPrompt: false,
      blinkieHeader: 'blinkiemaker!'.split('')
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
        
        this.currentGhostImg = new Image();
        this.currentGhostImg.src = this.currentItem;
        this.currentGhostImg.style.position = 'absolute';
        this.currentGhostImg.style['z-index'] = '100';

        this.$refs.container.appendChild(this.currentGhostImg)
      }
    },
    onItemMouseUp () {
      if (!this.dragging) return;
      this.dragStart = false;
      this.dragging = false;
      this.currentItem = null;
      this.removeGhostImage();
    },
    setupGhostEventListener () {
      document.body.addEventListener('mousemove', e => {
        if (this.currentGhostImg === null) return;

        this.currentGhostImg.style.top = `${e.pageY}px`;
        this.currentGhostImg.style.left = `${e.pageX}px`;
      }, false);
    },
    saveCanvas () {
      this.$refs.blinkieCanvas.saveCanvas();
    },
    saveAsGif () {
      this.$refs.blinkieCanvas.saveAsGif();
    },
    duplicateFrame (frame) {
      this.$refs.blinkieCanvas.duplicateFrame(frame);
    },
    addFrame () {
      this.$refs.blinkieFrames.addFrame();
    },
    removeGhostImage () {
      if (this.currentGhostImg === null) return;
      this.currentGhostImg.remove();
      this.currentGhostImg = null;
    }
  },
  mounted () {
    this.setupGhostEventListener();
  }
}
</script>

<style>
  #info {
    cursor: pointer;
  }
</style>