<template>
<div class="main" @click="onItemMouseUp">
  <div class="container">
    <h1>blinkie maker!</h1>
    <div class="content-container">
      <div id="blinkieItems" class="blinkie-items">
        <div v-for="section of itemSections" :key="section.heading">
          <h2>{{ section.heading }}</h2>
          <div class="blinkie-items__items">
            <img 
              v-for="item of section.items"
              :key="item"
              draggable="false" 
              :src="item" 
              @mousedown="onItemMouseDown" 
              @mousemove="onItemMouseMove(item)" />
          </div>
        </div>
      </div>
      <div class="canvas__container">
        <canvas id="c" ref="canvas" class="canvas"></canvas>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import blocks from "../static/assets/blinkie/blocks/*.png";
import letters from "../static/assets/blinkie/letters/*.png";
import path from 'path'

export default {
  name: 'App',
  data () {
    return {
      canvas: null,
      grid: 25,
      itemSections: [
        {
          heading: 'Blocks',
          items: [
            blocks['Blinkie_BG']
          ]
        },
        {
          heading: 'Letters',
          items: [
            letters['Blinkie_Letter_A']
          ]
        }
      ],
      dragStart: false,
      dragging: false,
      currentItem: null,
      currentItemObj: null,
      addedItem: false
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
      this.currentItemObj = null;
    },
    snapToGrid (x, y) {
      let left = Math.round(x / this.grid) * this.grid;
      let top = Math.round(y / this.grid) * this.grid;

      if (left < 0) left = 0;
      if (top < 0) top = 0;

      if (left >= this.canvas.width) left = this.canvas.width - this.grid;
      if (top >= this.canvas.height) top = this.canvas.height - this.grid;

      return {
        left,
        top
      }
    },
    addImage (url, x, y) {
      fabric.Image.fromURL(url, img => {
        img.set({ ...this.snapToGrid(x, y), hasControls: false, hasBorders: false })
        this.currentItemObj = img;
        this.canvas.add(img);
      });
    },
    initialiseCanvas () {
      this.canvas = new fabric.Canvas('c', {
        selection: false,
        width: 500,
        height: 500
      });
  
      let gridLineOptions = {
        stroke: '#ccc',
        selectable: false,
        evented: false
      }
  
      for (var i = 0; i < (this.canvas.width / this.grid); i++) {
        this.canvas.add(
          new fabric.Line([i * this.grid, 0, i * this.grid, this.canvas.width], gridLineOptions));
        this.canvas.add(
          new fabric.Line([0, i * this.grid, this.canvas.width, i * this.grid], gridLineOptions))
      }
  
      this.canvas.on('object:moving', (options) => { 
        options.target.set(this.snapToGrid(options.target.left, options.target.top));
      });

      this.canvas.on('mouse:over', ({ e }) => {
        if (this.dragging && !this.addedItem) {
          this.addImage(this.currentItem, e.offsetX, e.offsetY)
          this.addedItem = true;
        } else if (!this.dragging){
          this.addedItem = false;
        }
      })

      this.canvas.on('mouse:move', ({ e }) => {
        if (this.dragging && this.currentItemObj !== null) {
          this.currentItemObj.set(this.snapToGrid(e.offsetX, e.offsetY))
          this.currentItemObj.setCoords();
          this.canvas.renderAll();
        }
      })
    }
  },
  mounted () {
    this.initialiseCanvas();
  }
}
</script>