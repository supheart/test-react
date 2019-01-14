<template>
  <div class="viewer-list-container" :style="getContainerStyle()">
    <image-container v-for="(item, i) in urls" :key="item.id" :data="item" :left="perDistance * i" :speed="speed" :handleStart="handleStart" :handleMove="handleMove" :handleEnd="handleEnd"></image-container>
  </div>
</template>

<script>
import ImageContainer from './ImageContainer';
const screenWidth = typeof document !== 'undefined' && document.documentElement.clientWidth;
const screenHeight = typeof document !== 'undefined' && document.documentElement.clientHeight;
// 快速拖动时间限制
const DEFAULT_TIME_DIFF = 200;

/**
 * 拖拽的缓动公式 - easeOutSine
 * Link http://easings.net/zh-cn#
 * t: current time（当前时间）；
 * b: beginning value（初始值）；
 * c: change in value（变化量）；
 * d: duration（持续时间）。
 */
function easing(distance) {
  const t = distance;
  const b = 0;
  const d = screenWidth;  // 允许拖拽的最大距离
  const c = d / 2.5;
  
  return c * Math.sin((t / d) * (Math.PI / 2)) + b;
}

export default {
  name: 'list-container',
  data() {
    return {
      perDistance: screenWidth + this.gap,
      left: 0
    }
  },
  props: {
    speed: Number,
    urls: Array,
    index: Number,
    gap: Number,
    changeIndex: Function
  },
  created() {
    this.length = this.urls.length;
    this.maxLeft = this.perDistance * (this.length - 1);
    this.isNeedSpring = false;
    this.left = -this.perDistance * this.index;
  },
  watch: {
    index: function(val) {
      this.isNeedSpring = true;
      this.left = -this.perDistance * val;
    },
  },
  methods: {
    getContainerStyle() {
      const defaultStyle = {};
      if(this.isNeedSpring) {
        const duration = `${this.speed}ms`;
        defaultStyle.WebkitTransitionDuration = duration;
        defaultStyle.transitionDuration = duration;
      }
      const translate = `translate3d(${this.left}px, 0, 0)`;
      defaultStyle.transform = translate;
      defaultStyle.WebkitTransform = translate;
      return defaultStyle;
    },
    handleStart() {
      this.startLeft = -this.perDistance * this.index;
      this.startTime = +new Date();
      this.isNeedSpring = false;
    },
    handleMove(diffX) {
      // 图片左右移动时外层容器位置的变化
      let nDiffX = diffX;
      // 限制最大的DiffX
      if(Math.abs(nDiffX) > screenWidth) {
        if(nDiffX < 0) nDiffX = -screenWidth;
        if(nDiffX > 0) nDiffX = screenWidth;
      }

      if(this.left >= 0 && nDiffX > 0) {
        nDiffX = easing(nDiffX);
      } else if (this.left <= -this.maxLeft && nDiffX < 0) {
        nDiffX = -easing(-nDiffX);
      }

      this.left = this.startLeft + nDiffX;
    },
    handleEnd(isAllowChange) {
      let index;
      const diffTime = +new Date() - this.startTime;
      if(isAllowChange && diffTime < DEFAULT_TIME_DIFF) {
        if(this.left < this.startLeft) {
          index = this.index + 1;
        } else {
          index = this.index - 1;
        }
      } else {
        index = Math.abs(Math.round(this.left / this.perDistance));
      }

      // 处理边界情况
      if(index < 0) {
        index = 0;
      } else if (index > this.length - 1) {
        index = this.length - 1;
      }

      this.left = -this.perDistance * index;
      this.isNeedSpring = true;
      if(index !== this.index) {
        this.changeIndex(index);
        return true;
      }
      return false;
    }
  },
  components: {
    ImageContainer
  }
};
</script>

<style scoped lang="scss">
.viewer-list-container{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  transition-property: transform;
}
</style>
