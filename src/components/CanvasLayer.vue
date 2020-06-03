<template>
<div class="canvas">
  <canvas :id="canvasId" class="canvas" @keyup.delete="deleteActiveItem"></canvas>
</div>
</template>

<script>
export default {
  name: 'CanvasLayer',
  props: {
    grid: Number,
    currentItem: Object | null,
    dragging: Boolean,
    frame: Number
  },
  data () {
    return {
      canvas: null,
      currentItemObj: null
    }
  },
  computed: {
    canvasId () {
      return `canvas-${this.frame}`;
    }
  },
  watch: {
    currentItem () {
      if (this.currentItem === null)
        this.currentItemObj = null;
    }
  },
  methods: {
    clear () {
      this.canvas.clear();
      this.initCanvas();
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
        this.canvas.setActiveObject(img);
      });
    },
    initCanvas () {
      this.canvas = new fabric.Canvas(this.canvasId, {
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

      this.initCanvasListeners();
    },
    initCanvasListeners () {
      this.canvas.on('object:moving', (options) => { 
        options.target.set(
            this.snapToGrid(options.target.left, options.target.top));
      });

      this.canvas.on('mouse:over', ({ e }) => {
        if (this.dragging && this.currentItemObj == null)
          this.addImage(this.currentItem, e.offsetX, e.offsetY)
      })

      this.canvas.on('mouse:move', ({ e }) => {
        if (this.dragging && this.currentItemObj !== null) {
          this.currentItemObj.set(this.snapToGrid(e.offsetX, e.offsetY))
          this.currentItemObj.setCoords();
          this.canvas.renderAll();
        }
      })
    },
    deleteActiveItem () {
      const active = this.canvas.getActiveObject();
      if (active == undefined) return;

      this.canvas.remove(active);

    }
  },
  mounted () {
    this.initCanvas();
  }
}
</script>