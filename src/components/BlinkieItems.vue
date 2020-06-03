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
    </div>
  </div>
</template>

<script>
import blocks from "../../static/assets/blinkie/blocks/*.png";
import letters from "../../static/assets/blinkie/letters/*.png";

export default {
  name: 'BlinkieItems',
  data () {
    return {
      sections: [
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
    }
  }
}
</script>