<template>
  <div class="blinkie-items">
    <div 
      v-for="section of sections" 
      :key="section.heading"
      class="blinkie-items__section">
      <h2>{{ section.heading }}</h2>
      <div class="blinkie-items__items-container">
        <div 
          class="blinkie-item" 
          v-for="item of section.items"
          :key="item"
          @mousedown="onItemMouseDown" 
          @mousemove="onItemMouseMove(item)" >
          <img 
            draggable="false"
            :src="item"  />
        </div>
      </div>
      <label v-if="section.heading === 'Custom'" class=" button button--block">
        Add Custom Image
        <input 
          ref="imageUploader"
          type="file"
          accept="image/*" 
          name="images"
          multiple="true"
          @change="addImages" />
      </label>
    </div>
  </div>
</template>

<script>
import blocks from "../../static/assets/blinkie/blocks/*.png";
import letters from "../../static/assets/blinkie/letters/*.png";

export default {
  name: 'BlinkieItems',
  props: [ 'grid' ],
  data () {
    return {
      customImages: []
    }
  },
  computed: {
    sections () {
      return [
        {
          heading: 'Blocks',
          items: [
            blocks['Blinkie_BG']
          ]
        },
        {
          heading: 'Letters',
          items: [
            letters['letter-a']
          ]
        },
        {
          heading: 'Custom',
          items: this.customImages
        }
      ]
    }
  },
  methods: {
    onItemMouseDown () {
      this.$emit('item-mouse-down');
    },
    onItemMouseMove (item) {
      this.$emit('item-mouse-move', item);
    },
    getCustomImages () {
      let images = localStorage.getItem('customImages');

      return images === null
        ? []
        : JSON.parse(images);
    },
    setCustomImages (images = []) {
      const currentImages = this.getCustomImages();
      const newImages = [ ...currentImages, ...images ];
      localStorage.setItem('customImages', JSON.stringify(newImages))
      this.customImages = newImages;
    },
    async addImages (event) {
      let images = event.target.files || event.dataTransfer.files;
      let imagePromises = [];
      
      for (const image of images) {
        imagePromises.push(new Promise(res => {
          let reader = new FileReader();
  
          reader.readAsDataURL(image);
          reader.onload = e => res(e.target.result);
        }))
      }

      let urls = await Promise.all(imagePromises)
      this.setCustomImages(urls);

      this.$refs.imageUploader[0].value = '';
    }
  },
  mounted () {
    // add user custom images from local storage
    this.setCustomImages()
  }
}
</script>