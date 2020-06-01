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
  methods: {
    createMockCanvas (id, width, height) {
      const mock = document.createElement('canvas');
      mock.id = 'mock-canvas--id';

      return new fabric.Canvas(mock.id, { width, height })
    },
    createGif (frames, width, height) {
      return new Promise ((res, rej) => {
        // NEED TO NOT USE PURE BLACK (0,0,0) BECAUSE 
        // THAT'S THE TARGET TRANSPARENT COLOUR
        let exported = new GIF({
          workers: 2,
          quality: 5,
          width,
          height,
          transparent: 'rgba(0,0,0,0)'
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
        if (images.length === 0) return null;
  
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
    async saveAsGif () {
      const canvasClasses = this.$refs.frames.map(x => x.canvas);
      let canvasArray = await Promise.all(
          canvasClasses.map(async x => await this.createCanvasFrame(x)));

      if (canvasArray.length === 0) return;

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
          image.set({ 
            left: image.left - smallestX,
            top: image.top - smallestY
          })
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
        this.$emit('update:images', [ gifUrl ])
      };

      reader.readAsDataURL(exportedGif);
      
    },
    async saveCanvas () {
      const index = this.$refs.frames.findIndex(x => x.frame === this.activeFrame);
      if (index < 0) return;
      let canvasRef = this.$refs.frames[index].canvas;
      let canvas = await this.createCanvasFrame(canvasRef);

      if (canvas === null) return;
      
      let clonedCanvas = await this.createMockCanvas(index, canvas.width, canvas.height);

      canvas.images.forEach(i => {
        i.set({ 
          left: i.left - canvas.smallestX,
          top: i.top - canvas.smallestY
        })
        clonedCanvas.add(i)
      })
      
      // export to image
      const url = clonedCanvas.toDataURL();
      await this.$nextTick();

      this.downloadFile(url);
    }
  }
}
</script>