<template>
  <div>
    <!-- <viewer :urls="urls"></viewer> -->
    <viewer :list="urls"></viewer>
  </div>
</template>

<script>
// import Viewer from '@/index.js';
import Viewer from 'mux-vue-image-viewer';

export default {
  name: 'home',
  data() {
    return {
      urls: [
        {
          id: 1,
          src: '/static/img/0.jpg'
        }, {
          id: 2,
          src: '/static/img/1.jpg'
        }, {
          id: 3,
          src: '/static/img/2.jpg'
        }, {
          id: 4,
          src: '/static/img/3.jpg'
        }, {
          id: 5,
          src: '/static/img/4.jpg'
        }
      ]
    };
  },
  created() {
  },
  components: {
    Viewer
  }
}
</script>
