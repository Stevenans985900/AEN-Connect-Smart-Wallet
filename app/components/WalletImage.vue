<template>
  <img :src="imagePath" :alt="wallet.name" onError="console.log('image error');this.onerror=null;this.src='/question.png';">
</template>

<script>

  import $g from '~/globals.json'

  export default {
    props: {
      wallet: {
        type: Object,
        default: function() {
          return {};
        }
      }
    },
    data() {
      return {
        fallbackImage: 'unknown.png',
        imagePath: ''
      };
    },
    beforeMount: function() {
      // If the image is a contract type, load by address otherwise use the plain network image
      if(this.wallet.type === 'contract') {
        this.imagePath = $g.internal.baseImagePath + 'wallet/' + this.wallet.address + '.png'
      } else {
        this.imagePath = $g.internal.baseImagePath + 'wallet/' + this.wallet.type + '.png'
      }
    }
  };
</script>
