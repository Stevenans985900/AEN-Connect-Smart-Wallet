<template>
  <span>
    <v-btn outline @click="clickBackupWallet">
      <v-icon v-if="showIcon === true">
        security
      </v-icon>
      {{ $t('wallet.action.backup') }}
    </v-btn>
    <v-dialog v-model="dialogBackup" max-width="600px">
      <v-toolbar color="primary">
        <v-toolbar-title>{{ $t('backup.action.choose_wallet') }}</v-toolbar-title>
        <v-spacer />
        <v-btn small fab outline @click="dialogBackup = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <p>{{ $t('backup.message.backup_explained') }}</p>

          <v-list subheader>
            <v-list-tile
              v-for="contextWallet in wallets"
              :key="contextWallet.address"
              avatar
              @click="backupWallet(contextWallet)"
            >
              <v-list-tile-avatar>
                <wallet-image :wallet="contextWallet" />
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title>{{ contextWallet.name }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import CryptoJS from 'crypto-js'

export default {
  props: {
    showIcon: {
      type: Boolean,
      default: false
    },
    wallet: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      dialogBackup: false
    }
  },
  computed: {
    wallets() {
      return this.$store.state.wallet.wallets
    },
    version() {
      return this.$g('aen.network_version')
    }
  },
  methods: {
    clickBackupWallet() {
      if (Object.keys(this.wallet).length === 0) {
        this.dialogBackup = true
      } else {
        this.backupWallet(this.wallet)
      }
    },
    backupWallet(wallet) {
      const exportName = wallet.name + '-' + wallet.type + '-' + new Date().toISOString().slice(0, 10)
        const forExport = {
          address: wallet.address,
          wallet: wallet,
          credentials: this.$store.state.security.wallets[wallet.address].credentials
        }
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(forExport))
      const downloadAnchorNode = document.createElement('a')
      downloadAnchorNode.setAttribute('href', dataStr)
      downloadAnchorNode.setAttribute('download', exportName + '.json')
      document.body.appendChild(downloadAnchorNode)
      downloadAnchorNode.click()
      downloadAnchorNode.remove()

      // Create an encrypted version of the backup
      const encrypted = 'data:application/octet-stream,' + CryptoJS.AES.encrypt(JSON.stringify(forExport), this.$g('salt')).toString()
      const downloadEncryptedAnchorNode = document.createElement('a')
      downloadEncryptedAnchorNode.setAttribute('href', encrypted)
      downloadEncryptedAnchorNode.setAttribute('download', exportName + '.enc')
      document.body.appendChild(downloadEncryptedAnchorNode)
      downloadEncryptedAnchorNode.click()
      downloadEncryptedAnchorNode.remove()

      this.$store.commit('showNotification', {
        type: 'info',
        message: 'A plain JSON version and an encrypted version (which can only be read from this program) have requested download'
      })
    }
  }
}
</script>
