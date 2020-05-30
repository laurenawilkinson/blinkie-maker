<template>
  <div class="blinkie-frames">
    <div 
      :class="{ 'blinkie-frame': true, 'active': active == frame }"
      v-for="frame in frames"
      :key="frame"
      @click="selectFrame(frame)">
      {{ frame }}
    </div>
    <button type="button" @click="addFrame">Add frame</button>
  </div>
</template>

<script>
export default {
  name: 'BlinkieFrames',
  model: {
    prop: 'active',
    event: 'change'
  },
  props: [ 'active', 'frames' ],
  computed: {
    localFrames: {
      get () {
        return this.frames;
      },
      set (value) {
        this.$emit('update:frames', value)
      }
    }
  },
  methods: {
    selectFrame (frame) {
      this.$emit('change', frame)
    },
    addFrame () {
      const newFrame = this.frames[this.frames.length - 1] + 1;
      this.localFrames.push(newFrame)

      this.selectFrame(newFrame);
    }
  }
}
</script>