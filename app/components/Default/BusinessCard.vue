<template>
  <v-layout >
    <v-card flat>
      <v-card-title>
        <address-render :address="wallet.address"/>
      </v-card-title>
      <v-card-text>
        <v-img :src="imageData" aspect-ratio="1"/>
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script>
  import qrCodeGenerator from "qrcode-generator"
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
        imageData: ''
      }
    },
    watch: {
      wallet: function() {
        this.processWallet()
      }
    },
    mounted: function() {
      this.processWallet()
    },
    methods: {
      processWallet() {
        console.log('processing the wallet from business card')
        console.log(this.wallet)
        if(this.wallet.hasOwnProperty('address')) {
          var qr = qrCodeGenerator(0, "M");
          qr.addData(this.wallet.address);
          qr.make();
          this.imageData = qr.createDataURL(5);
        }
      }
    }
  }
</script>
