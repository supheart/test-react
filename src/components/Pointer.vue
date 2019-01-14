<template>
  <div class="viewer-image-pointer">
    <span v-for="i in length" @click="changeIndex(i - 1)" :key="i" :class="{'pointer': true, 'active': i - 1 === index}"></span>
  </div>
</template>

<script>
export default {
  name: 'pointer',
  props: {
    index: Number,
    changeIndex: Function,
    length: Number
  }
};
</script>

<style scoped lang="scss">
.viewer-image-pointer{
  position: fixed;
  bottom: 10px;
  left: 0;
  width: 100%;
  text-align: center;
  .pointer{
    display: inline-block;
    width: 8px;
    height: 8px;
    margin: 0 5px;
    border-radius: 100%;
    background-color: #333;
    &.active{
      background-color: #eee;
    }
  }
}
</style>
