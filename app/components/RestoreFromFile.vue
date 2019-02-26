<template>
  <upload-button :file-changed-callback="fileUploaded" :title="$t('backup.label.file_choose')">
    <template slot="icon">
      <v-icon>attach_file</v-icon>
    </template>
  </upload-button>
</template>

<script>
// TODO - Add in logic for handling multiple wallets being present in the same file upload
import EventEmitter from 'events'
import CryptoJS from 'crypto-js'
// import isElectron from 'is-electron'
import UploadButton from 'vuetify-upload-button'

export default {
  components: {
    UploadButton
  },
  props: {
    // If network type specified, restrict import to this type
    type: {
        type: String,
        default: ''
    },
    // Forcee imported wallet to be considered main AEN wallet
    main: {
      type: Boolean,
      default: function () {
        return false
      }
    }
  },
  data() {
    return {
      wallet: {}
    }
  },
  methods: {
    fileUploaded(file) {
      // Create the construct to handle both app / browser situations
      const fileUploadedEmitter = new EventEmitter()
      fileUploadedEmitter.on(
        'ready',
        function (walletData) {
          try {
            const extension = walletData.fileName.split('.').pop()
            let walletInformation
            if (extension === 'enc') {
              const bytes = CryptoJS.AES.decrypt(walletData.data, this.$g('salt'))
              walletInformation = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
            } else {
              walletInformation = JSON.parse(walletData.data)
            }
            walletInformation.credentials = JSON.parse(CryptoJS.AES.decrypt(
                walletInformation.credentials,
                this.$g('salt')
            ).toString(CryptoJS.enc.Utf8))
            // If prop states wallet is a main, force property in wallet
            if (this.main === true) {
              walletInformation.main = true
            }

            if(this.type !== '' && this.type !== walletInformation.type) {
              throw 'Wallet type does not meet type requirement (' + this.type + ')'
            }
            this.$store.dispatch('wallet/load', walletInformation).then((wallet) => {
                this.$emit('complete', wallet)
            })


          } catch (e) {
              console.debug(e)
            this.$store.commit('showNotification', {
              type: 'error',
              message: this.$t('backup.message.import_bad_file')
            })
          }
        }.bind(this)
      )

      // Fork condition depending on the environment
      // if (isElectron()) {
      //   const fs = require('fs')
      //   fs.readFile(file.path, 'utf8', (err, data) => {
      //     if (err) throw err
      //     fileUploadedEmitter.emit('ready', { data: data, fileName: file.name })
      //   })
      // } else {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = function (event) {
        fileUploadedEmitter.emit('ready', { data: event.target.result, fileName: file.name })
      }
      // }
    }
  }
}
</script>
