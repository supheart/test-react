<template>
  <wrap-viewer :urls="urls"></wrap-viewer>
</template>

<script>
import WrapViewer from './WrapViewer';

export default {
  name: 'viewer',
  props: {
    urls: Array
  },
  components: {
    WrapViewer
  }
};
</script>
