<template>
  <div class="image-viewer">
    <div class="viewer-cover"></div>
    <list-container :urls="urls" :index="curIndex" :gap="gap" :changeIndex="changeIndex" :speed="speed"></list-container>
    <pointer :length="urls.length" :index="curIndex" :changeIndex="changeIndex"></pointer>
  </div>
</template>

<script>
import ListContainer from './ListContainer';
import Pointer from './Pointer';

export default {
  name: 'wrap-viewer',
  data() {
    return {
      curIndex: this.index
    }
  },
  props: {
    index: {
      type: Number,
      default: 0
    },
    gap: {
      type: Number,
      default: 10
    },
    speed: {
      type: Number,
      default: 300
    },
    maxZoomNum: {
      type: Number,
      default: 4
    },
    zIndex: {
      type: Number,
      default: 100
    },
    urls: Array
  },
  methods: {
    changeIndex(index) {
      this.curIndex = index;
    }
  },
  components: {
    ListContainer,
    Pointer
  }
};
</script>

<style scoped lang="scss">
.image-viewer{
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  .viewer-cover{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
  }
}
</style>
