<template>
  <div class="blinkie-canvas">
    <aside class="toolbar">
      <button 
        type="button" 
        :disabled="activeFrameItems < 1" 
        @click="clearCurrentFrame">Clear</button>
    </aside>
    <div class="canvas__container">
      <canvas-layer 
        v-for="frame in frames"
        :key="frame"
        ref="frames"
        v-show="frame == activeFrame"
        v-bind="{ grid, currentItem, dragging, frame }"
        @remove-ghost-image="$emit('remove-ghost-image')"
        @active-items="getActiveFrameItems" />
    </div>
  </div>
</template>

<script>
import 'regenerator-runtime/runtime'
import CanvasLayer from './CanvasLayer.vue';

// NOTE:  this file has been changed to hardcode 
//        the workerScript file path. it wouldn't
//        work otherwise.
import GIF from '../../static/js/gif.js'

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
    frames: Array,
    images: Array
  },
  data () {
    return {
      activeFrameItems: 0
    }
  },
  computed: {
    currentFrame () {
      return this.frames.find(f => f === this.activeFrame) || null;
    }
  },
  methods: {
    getActiveFrameItems (items) {
      this.activeFrameItems = items;
    },
    getActiveFrameIndex () {
      return this.frames.findIndex(f => f === this.activeFrame);
    },
    clearCurrentFrame () {
      const index = this.getActiveFrameIndex();
      if (index < 0) return;

      this.$refs.frames[index].clear();
    },
    createMockCanvas (id, width, height) {
      const mock = document.createElement('canvas');
      mock.id = 'mock-canvas--id';

      return new fabric.Canvas(mock.id, { width, height })
    },
    createGif (frames, width, height) {
      return new Promise ((res, rej) => {
        // use transparent color
        let transparent = 'rgb(255, 0, 255)';
        let exported = new GIF({
          workers: 2,
          quality: 5,
          width,
          height,
          transparent
        });
  
        frames.map(frame => exported.addFrame(frame));
  
        exported.on('finished', blob => res(blob));
  
        exported.render();
      })
    },
    downloadFile (url, fileName = 'Blinkie') {
      const tag = document.createElement('a');
      tag.href = url;
      tag.setAttribute('download', fileName);
      tag.click();
    },
    async createCanvasFrame (canvas) {
      return new Promise (async (res, rej) => {
        const images = canvas.getObjects('image');
        if (images.length === 0) return res(null);
  
        let smallestX = Math.min(...images.map(x => x.left));
        let smallestY = Math.min(...images.map(x => x.top));
        let largestXIndex = images.map(x => x.left).indexOf(Math.max(...images.map(x => x.left)))
        let largestYIndex = images.map(x => x.top).indexOf(Math.max(...images.map(x => x.top)))
  
        let width = (images[largestXIndex].left - smallestX) + images[largestXIndex].width;
        let height = (images[largestYIndex].top - smallestY) + images[largestYIndex].height;
        
        let clonedImages = [];
        let clonePromises = [];
  
        images.map(async i => {
          await clonePromises.push(new Promise(res => {
            i.clone(clone => {
              clonedImages.push(clone)
              res()
            })
          }))
        })
  
        await Promise.all(clonePromises)
  
        res({ 
          smallestX, 
          smallestY, 
          largestXIndex, 
          largestYIndex, 
          largestX: images[largestXIndex].left, 
          largestY: images[largestYIndex].top, 
          largestXWidth: images[largestXIndex].width,
          largestYHeight: images[largestYIndex].height,
          width, 
          height, 
          images: clonedImages })
      })
    },
    setImageOffset (image, offsetX, offsetY) {
      image.set({ 
        left: image.left - offsetX,
        top: image.top - offsetY
      })
    },
    async saveAsGif () {
      const canvasClasses = this.$refs.frames.map(x => x.canvas);
      let canvasArray = await Promise.all(
          canvasClasses.map(async x => await this.createCanvasFrame(x)));

      if (canvasArray.length === 0) return;
      if (canvasArray.filter(x => x === null).length === canvasArray.length) return;

      // remove nulls from canvas array
      canvasArray = canvasArray.filter(x => x !== null);

      let smallestX = Math.min(...canvasArray.map(x => x.smallestX));
      let smallestY = Math.min(...canvasArray.map(x => x.smallestY));
      
      let largestXIndex = canvasArray.map(x => x.largestX).indexOf(Math.max(...canvasArray.map(x => x.largestX)))
      let largestYIndex = canvasArray.map(x => x.largestY).indexOf(Math.max(...canvasArray.map(x => x.largestY)))

      // the largest X and Y OVERALL from ALL images
      let largestX = canvasArray[largestXIndex].largestX;
      let largestY = canvasArray[largestYIndex].largestY;

      // the width and height of the largest X/Y to add to the final width
      // so that they don't get cut off
      let largestXWidth = canvasArray[largestXIndex].largestXWidth;
      let largestYHeight = canvasArray[largestYIndex].largestYHeight;
      
      let width = (largestX - smallestX) + largestXWidth;
      let height = (largestY - smallestY) + largestYHeight;
      
      let frameArray = [];

      for (let i = 0; i < canvasArray.length; i++) {
        let clonedCanvas = await this.createMockCanvas(i, width, height);
        let canvas = canvasArray[i];

        for (let image of canvas.images) {
          // set images relevant to their offset
          this.setImageOffset(image, smallestX, smallestY)
          clonedCanvas.add(image)
        }

        const url = clonedCanvas.toDataURL();
        const imageElement = document.createElement('img');
        imageElement.src = url;
        frameArray.push(imageElement);
      }

      await this.$nextTick();

      const exportedGif = await this.createGif(frameArray, width, height);
      const reader = new FileReader();
      reader.onload = e => {
        let gifUrl = e.target.result;

        this.downloadFile(gifUrl);
        // this.$emit('update:images', [ gifUrl ])
      };

      reader.readAsDataURL(exportedGif);
      
    },
    async saveCanvas () {
      const index = this.getActiveFrameIndex();
      if (index < 0) return;
      let canvasRef = this.$refs.frames[index].canvas;
      let canvas = await this.createCanvasFrame(canvasRef);

      if (canvas === null) return;
      
      let clonedCanvas = await this.createMockCanvas(index, canvas.width, canvas.height);

      canvas.images.forEach(i => {
        this.setImageOffset(i, canvas.smallestX, canvas.smallestY)
        clonedCanvas.add(i)
      })
      
      // export to image
      const url = clonedCanvas.toDataURL();
      await this.$nextTick();

      this.downloadFile(url);
    }
  },
  mounted () {
    document.addEventListener('keyup', e => {
      if (e.key !== 'Delete') return;
      
      const index = this.getActiveFrameIndex();
      if (index < 0) return;

      this.$refs.frames[index].deleteActiveItem();
    })
  }
}
</script>