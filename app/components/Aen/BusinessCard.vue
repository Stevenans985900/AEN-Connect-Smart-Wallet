<template>
  <v-layout >
    <v-card flat>
      <v-card-title>
        <address-render :address="wallet.address"/>
      </v-card-title>
      <v-card-text>
        <v-img :src="qrData" aspect-ratio="1"/>
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
    computed: {
      qrData() {
        var qr = qrCodeGenerator(0, "M");
        qr.addData(this.wallet.address);
        qr.make();
        return qr.createDataURL(5);
      }
    }
  }
</script>
