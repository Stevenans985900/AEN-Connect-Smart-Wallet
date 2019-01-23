<template>
  <img :src="imagePath" :alt="wallet.name">
</template>

<script>
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
        // this.imagePath = $g('internal.baseImagePath') + '/network/' + this.wallet.address + '.png'
        this.imagePath = '/wallet/' + this.wallet.address + '.png'
      } else {
        // this.imagePath = $g('internal.baseImagePath') + '/network/' + this.wallet.type + '.png'
        this.imagePath = '/wallet/' + this.wallet.type + '.png'
      }
      console.log(this.imagePath)
    }
  };
</script>
