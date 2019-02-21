<template>
  <v-card flat>
    <v-card-text class="text-xs-center">
      <address-render :address="wallet.address" :use-address-book="useAddressBook" />
      <v-text-field
        v-if="includePrivateKey"
        v-model="privateKey"
        :append-icon="showPrivateKey ? 'visibility_off' : 'visibility'"
        :type="showPrivateKey ? 'text' : 'password'"
        label="Private Key, click the eye to reveal"
        readonly
        @click:append="showPrivateKey = !showPrivateKey"
      />
      <v-img :src="imageData" aspect-ratio="1" />
    </v-card-text>
  </v-card>
</template>

<script>
import qrCodeGenerator from 'qrcode-generator'
export default {
  props: {
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    },
    useAddressBook: {
      type: Boolean,
      default: true
    },
    includePrivateKey: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      imageData: '',
      showPrivateKey: false
    }
  },
    computed: {
      privateKey() { return this.$store.getters['security/secureProperty']({
          key: 'privateKey',
          address: this.wallet.address
      }) }
    },
  watch: {
    wallet: function () {
      this.processWallet()
    }
  },
  mounted: function () {
    this.processWallet()
  },
  methods: {
    processWallet() {
      if (this.wallet.hasOwnProperty('address')) {
        const qr = qrCodeGenerator(0, 'M')
        qr.addData(this.wallet.address)
        qr.make()
        this.imageData = qr.createDataURL(5)
      }
    }
  }
}
</script>
