<template>
  <img :src="imagePath" :alt="wallet.name">
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
        imagePath: ''
      };
    },
    mounted: function() {
      // If the image is a contract type, load by address otherwise use the plain network image
      if(this.wallet.type === 'contract') {
        this.imagePath = $g.internal.baseImagePath + 'wallet/' + this.wallet.address + '.png'
      } else {
        this.imagePath = $g.internal.baseImagePath + 'wallet/' + this.wallet.type + '.png'
      }
    }
  };
</script>
