<template>
  <div 
    class="viewer-image-container" 
    :style="getContainerStyle()"
    @touchstart.prevent="handleTouchStart"
    @touchmove.prevent="handleTouchMove"
    @touchend.prevent="handleTouchEnd">
    <img v-if="isLoaded" :src="data.src" alt="" :style="getImgStyle()" />
    <loading v-else></loading>
  </div>
</template>

<script>
import raf from 'raf';
import tween from '../utils/tween.js';
import Loading from './Loading';

const screenWidth = typeof document !== 'undefined' && document.documentElement.clientWidth;
const screenHeight = typeof document !== 'undefined' && document.documentElement.clientHeight;

function setScope(value, min, max) {
  if(value < min) return min;
  if(value > max) return max;
  return value;
}

// 获取
function getDistanceBetweenTouches(e) {
  if(e.touches.length < 2) return 1;
  const x1 = e.touches[0].clientX;
  const y1 = e.touches[0].clientY;
  const x2 = e.touches[1].clientX;
  const y2 = e.touches[1].clientY;
  const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  return distance;
}

const maxZoomNum = 4; // 这个值从上级传下来，这里先写死
const minTapMoveValue = 5;
const maxTapTimeValue = 300;
const defaultScale = 1;
const maxAnimateTime = 1000;

export default {
  name: 'image-container',
  data() {
    return {
      clicks: 0,
      timer: null,
      actualWidth: 0, // 图片实际宽度
      actualHeight: 0, // 图片实际高度
      originWidth: 0, // 图片默认展示宽度
      originHeight: 0, // 图片默认展示高度
      originTop: 0, // 图片默认展示上边距
      originLeft: 0, // 图片默认展示左边距
      originScale: 0, // 图片默认情况的缩放比例
      img: null,
      isLoaded: false
    }
  },
  props: {
    data: Object,
    left: Number,
    speed: Number,
    handleStart: Function,
    handleMove: Function,
    handleEnd: Function
  },
  created() {
    this.onTouchStartTime = 0; // 单指触摸开始时间
    this.isTwoFingerMode = false; // 是否是双指模式

    this.oldPointLeft = 0; // 计算手指中间在图片上的位置
    this.oldPointTop = 0; // 计算手指中间在图片上的位置
    this._touchZoomDistanceStart = 0; // 用于记录双指的距离
    this.haveCallMoveFn = false;
    
    this.diffX = 0; // 记录最后move事件移动距离
    this.diffY = 0; // 记录最后move事件移动距离
    
    this.animationID = 0;
    this.animateStartTime = 0;
    this.animateStartValue = { x: 0, y: 0 };
    this.animateFinalValue = { x: 0, y: 0 };
    
    // 加载图片
    this.loadImg(this.data);
  },
  methods: {
    loadImg(data) {
      this.img = new Image();
      this.img.src = data.src;
      this.img.onload = this.onLoad;
      this.onerror = () => {
        this.isLoaded = true;
      }
      this.isLoaded = false;
    },
    onLoad() {
      this.actualWidth = this.img.width;
      this.actualHeight = this.img.height;
      const left = 0;
      let top = 0;
      this.originWidth = screenWidth;
      this.originHeight = (this.actualHeight / this.actualWidth) * screenWidth;
      this.originScale = 1;
      if(this.actualHeight / this.actualWidth < screenHeight / screenWidth) {
        top = parseInt((screenHeight - this.originHeight) / 2, 10);
      }
      this.originTop = top;
      this.imgTop = top;
      this.originLeft = left;
      this.isLoaded = true;
    },
    getImgStyle() {
      const defaultStyle = {};
      if(this.isNeedSpring) {
        const duration = `${this.speed}ms`;
        defaultStyle.WebkitTransitionDuration = duration;
        defaultStyle.transitionDuration = duration;
        defaultStyle.WebkitTransformOrigin = '50%';
        defaultStyle.transformOrigin = '50%';
      }
      const translate = `translate3d(${this.originLeft}px, ${this.originTop}px, 0) scale(${this.originScale})`;
      defaultStyle.transform = translate;
      defaultStyle.WebkitTransform = translate;
      defaultStyle.width = `${this.originWidth}px`;
      defaultStyle.height = `${this.originHeight}px`;
      setTimeout(() => {
        this.isNeedSpring = false;
      }, this.speed);
      return defaultStyle;
    },
    getContainerStyle() {
      return {width: `${screenWidth}px`, height: `${screenHeight}px`, left: `${this.left}px`};
    },
    handleTouchStart(event) {
      if(this.animationID) {
        raf.cancel(this.animationID);
      }
      // 判断单点和多点触控
      switch(event.touches.length) {
        case 1: {
          const targetEvent = event.touches[0];
          this.startX = targetEvent.clientX;
          this.startY = targetEvent.clientY;
          this.diffX = 0;
          this.diffY = 0;

          this.startTop = this.originTop;
          this.startLeft = this.originLeft;
          this.onTouchStartTime = +new Date();
          this.haveCallMoveFn = false;
          break;
        }
        case 2: {
          // 启动双指模式
          this.isTwoFingerMode = true;
          
          // 计算两个手指中间点屏幕上的坐标
          const middlePointClientLeft = Math.abs(Math.round((event.touches[0].clientX + event.touches[1].clientX) / 2));
          const middlePointClientTop = Math.abs(Math.round((event.touches[0].clientY + event.touches[1].clientY) / 2));

          // 保存图片初始位置和尺寸
          this.startTop = this.originTop;
          this.startLeft = this.originLeft;
          this.startScale = this.originScale;

          // 计算手指中间点在图片上的坐标值
          this.oldPointLeft = middlePointClientLeft - this.startLeft;
          this.oldPointTop = middlePointClientTop - this.startTop;

          this._touchZoomDistanceStart = getDistanceBetweenTouches(event);
          break;
        }
        default:
          break;
      }
    },
    handleTouchMove() {
      switch(event.touches.length) {
        case 1: {
          const targetEvent = event.touches[0];
          const diffX = targetEvent.clientX - this.startX;
          const diffY = targetEvent.clientY - this.startY;

          this.diffX = diffX;
          this.diffY = diffY;

          // 如果移动距离小于设定值，判定为点击，不做处理
          if(Math.abs(diffX) < minTapMoveValue && Math.abs(diffY) < minTapMoveValue) return;

          const scale = this.originScale;
          const left = this.originLeft;
          const width = scale * this.originWidth;
          if(Math.abs(diffX) > Math.abs(diffY)) {
            // 水平方向移动
            if(this.originScale === defaultScale && Math.abs(diffX) > minTapMoveValue) {
              this.haveCallMoveFn = true;
              this.callHandleMove(diffX);
              return;
            }

            if(diffX < 0 && this.startLeft <= this.originWidth - width) {
              this.haveCallMoveFn = true;
              this.callHandleMove(diffX);
              return;
            }

            if(diffX > 0 && this.startLeft >= 0) {
              this.haveCallMoveFn = true;
              this.callHandleMove(diffX);
              return;
            }
          }

          const height = scale * this.originHeight;
          let newTop = (screenHeight - height) / 2;
          const newLeft = this.startLeft + diffX;
          if(height > screenHeight || this.originScale === defaultScale) {
            newTop = this.startTop + diffY;
          }
          this.originTop = newTop;
          this.originLeft = newLeft;
          break;
        }
        case 2: {
          this._touchZoomDistanceEnd = getDistanceBetweenTouches(event);
          const zoom = Math.sqrt(this._touchZoomDistanceEnd / this._touchZoomDistanceStart);
          const scale = zoom * this.startScale;
          this.originTop = this.startTop + ((1 - zoom) * this.oldPointTop);
          this.originLeft = this.startLeft + ((1 - zoom) * this.oldPointLeft);
          this.originScale = scale;
          // alert(`${this._touchZoomDistanceEnd}, zoom = ${zoom}, left = ${this.originLeft}, top = ${this.originTop}, scale = ${this.originScale}`);
          // alert(2222, this.originTop, this.originLeft, this.originScale);
          break;
        }
        default:
          break;
      }
    },
    handleTouchEnd(event) {
      // 双指操作结束
      if(this.isTwoFingerMode) {
        const touchLen = event.touches.length;
        this.isTwoFingerMode = false;

        if(touchLen === 1) {
          const targetEvent = event.touches[0];
          this.startX = targetEvent.clientX;
          this.startY = targetEvent.clientY;
          this.diffX = 0;
          this.diffY = 0;
        }

        const scale = setScope(this.originScale, defaultScale, maxZoomNum);
        const width = scale * this.originWidth;
        const height = scale * this.originHeight;
        const zoom = scale / this.startScale;
        const left = setScope(this.startLeft + ((1 - zoom) * this.oldPointLeft), this.originWidth - width, 0);

        let top;
        if(height > screenHeight) {
          top = setScope(this.startTop + ((1 - zoom) * this.oldPointTop), screenHeight - height, 0);
        } else {
          top = (screenHeight - height) / 2;
        }

        if(touchLen === 1) {
          this.startLeft = left;
          this.startTop = top;
          this.startScale = scale;
        }
        this.originLeft = left;
        this.originTop = top;
        this.originScale = scale;
      } else {
        // 单指操作结束
        const diffTime = +new Date() - this.onTouchStartTime;
        const { diffX, diffY } = this;

        // 根据时间差和移动距离判定为点击，直接关闭组件
        if(diffTime < maxTapTimeValue && Math.abs(diffX) < minTapMoveValue && Math.abs(diffY) < minTapMoveValue) {
          // 调用最高级父组件的关闭时间
          // this.onClose();
          this.clicks++;
          if(this.clicks === 1) {
            this.timer = setTimeout(() => {
              this.clicks = 0;
            }, 500);
          } else{
            clearTimeout(this.timer);
            this.handleDbClick(event);
            this.clicks = 0;
          }
          return;
        }

        // 水平方向移动
        if(this.haveCallMoveFn) {
          const isChangeImage = this.callHandleEnd(diffY < 30);
          if(isChangeImage) {
            this.originLeft = 0;
            return;
          }
        }

        // 执行动画操作，恢复到原位置
        let x, y;
        const scale = this.originScale;
        const height = scale * this.originHeight;

        x = (diffX * maxAnimateTime / diffTime) + this.startLeft;
        y = ((diffY * maxAnimateTime) / diffTime) + this.startTop;

        if(this.originScale === defaultScale) {
          x = 0;
          if(height > screenHeight) {
            y = setScope(y, screenHeight - height, 0);
          } else {
            y = this.imgTop;
          }
        }
        this.animateStartValue = {
          x: this.originLeft,
          y: this.originTop
        };
        this.animateFinalValue = { x, y };
        this.animateStartTime = +new Date();
        this.startAnimate();
      }
    },
    callHandleMove(diffX) {
      if(!this.isCallHandleStart) {
        this.isCallHandleStart = true;
        if(this.handleStart) {
          this.handleStart();
        }
      }
      if(this.handleMove) {
        this.handleMove(diffX);
      }
    },
    callHandleEnd(isAllowChange) {
      if(this.isCallHandleStart) {
        this.isCallHandleStart = false;
        if(this.handleEnd) {
          return this.handleEnd(isAllowChange);
        }
      }
    },
    startAnimate() {
      this.animationID = raf(() => {
        const curTime = Date.now() - this.animateStartTime;
        let left, top;

        if(curTime > maxAnimateTime) {
          const width = this.originScale * this.originWidth;
          const height = this.originScale * this.originHeight;
          left = setScope(this.originLeft, this.originWidth - width, 0);

          if(height > screenHeight) {
            top = setScope(this.originTop, screenHeight - height, 0);
          } else {
            top = (screenHeight - height) / 2;
          }
          this.originLeft = left;
          this.originTop = top;
        } else {
          left = tween.easeOutQuart(curTime, this.animateStartValue.x, this.animateFinalValue.x, maxAnimateTime);
          top = tween.easeOutQuart(curTime, this.animateStartValue.y, this.animateFinalValue.y, maxAnimateTime);
          this.originLeft = left;
          this.originTop = top;
          this.startAnimate();
        }
      });
    },
    handleDbClick(e) {
      const zoom = this.actualWidth / (this.originScale * this.originWidth);
      this.isNeedSpring = true;
      if(zoom > 1) {
        this.originScale = zoom; 
      } else {
        this.originScale = 1;
        this.originLeft = 0;
        this.originTop = this.imgTop;
      }
    }
  },
  components: {
    Loading
  }
};
</script>

<style scoped lang="scss">
.viewer-image-container{
  position: absolute;
  left: 0;
  top: 0;
  // width: 100%;
  // height: 100%;
  overflow: hidden;
  img{
    position: absolute;
    left: 0;
    right: 0;
    transform-origin: left top;
    transition-property: transform;
  }
}
</style>
