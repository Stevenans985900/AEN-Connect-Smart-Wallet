<template>
  <img :src="imagePath" :alt="wallet.name" onError="this.onerror=null;this.src='question.png';">
</template>

<style scoped>
  img {
    max-width: 3rem;
    max-height: 3rem;
  }
</style>
<script>

export default {
  props: {
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      fallbackImage: 'unknown.png',
      imagePath: ''
    }
  },
  computed: {
    imageBasePath() { return this.$g('internal.baseImagePath') }
  },
  beforeMount: function () {
    // If the image is a contract type, load by address otherwise use the plain network image
    if (this.wallet.type === 'contract') {
      this.imagePath =  this.imageBasePath + 'wallet/' + this.wallet.address + '.png'
    } else {
      this.imagePath = this.imageBasePath + 'wallet/' + this.wallet.type + '.png'
    }
  }
}
</script>
