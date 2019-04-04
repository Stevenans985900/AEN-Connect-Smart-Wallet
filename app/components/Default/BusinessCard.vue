<template>
  <v-card flat>
    <v-card-text class="text-xs-center">
      <h4>{{ $t('common.label.address') }}</h4>
      <address-render :address="effectiveAddress" :use-address-book="useAddressBook" />
      <v-text-field
        v-if="includePrivateKey == true && privateProperty !== false"
        v-model="privateProperty"
        :append-icon="showPrivateKey ? 'visibility_off' : 'visibility'"
        :type="showPrivateKey ? 'text' : 'password'"
        label="Private Key, click the eye to reveal"
        readonly
        @click:append="showPrivateKey = !showPrivateKey"
      />
      <v-img v-if="imageData" :src="imageData" aspect-ratio="1" />
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
    },
    privatePropertyProperty: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      imageData: '',
      showPrivateKey: false
    }
  },
    computed: {
      effectiveAddress() {
          if(this.wallet.type === 'btc') {
              return this.wallet.receiverAddress
          }
          else {
              return this.wallet.address
          }
      },
      privateProperty() {
        let walletKey
        switch (this.wallet.type) {
          case 'aen':
            walletKey = 'accountPrivateKey'
            break
          case 'btc':
            walletKey = 'mnemonic'
            break
          default:
            walletKey = 'privateKey'
        }
        return this.$store.getters['security/secureProperty']({
          key: walletKey,
          address: this.wallet.address
        })
      }
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
      const qr = qrCodeGenerator(0, 'M')
      qr.addData(this.effectiveAddress)
      qr.make()
      this.imageData = qr.createDataURL(5)
    }
  }
}
</script>
