<template>
  <div class="viewer-image-loading"></div>
</template>

<script>
export default {
  name: 'loading'
};
</script>

<style scoped lang="scss">
.viewer-image-loading{
  position: absolute;
  margin: auto;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 32px;
  height: 32px;
  box-sizing: border-box;
  border-radius: 100%;
  border-width: 4px;
  border-style: solid;
  border-color: #333;
  border-bottom-color: #fff;
  animation: roll 1s linear infinite;
}

@keyframes roll{
  form{
    transform: rotate(0deg);
  }
  to{
    transform: rotate(360deg);
  }
}
</style>
