<template>
  <div class="blinkie-frames">
    <aside class="toolbar">
      <button type="button" class="button--block" @click="addFrame">Add frame</button>
    </aside>
    <div class="blinkie-frames__container">
      <div 
        :class="{ 'blinkie-frame': true, 'active': active == frame }"
        v-for="(frame, index) in frames"
        :key="frame"
        @click="selectFrame(frame)">
        <span>{{ frame }}</span>
        <div class="blinkie-frame__buttons">
          <button 
            type="button" 
            @click.stop="duplicateFrame(frame)">Copy</button>
          <button 
            v-if="frames.length > 1" 
            type="button" 
            @click.stop="deleteFrame(index)">X</button>
        </div>
      </div>
    </div>
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
    },
    duplicateFrame (frame) {
      this.addFrame();
      this.$nextTick(() => this.$emit('duplicate-frame', frame))
      
    },
    deleteFrame (index) {
      if (this.localFrames.length === 1) return;
      this.localFrames.splice(index, 1);

      const lastFrame = this.localFrames[this.localFrames.length - 1];
      this.selectFrame(lastFrame)
    }
  }
}
</script>