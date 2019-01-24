<template>
  <v-layout>
    <v-btn class="success" @click="clickBackupWallet">
      Backup Wallet
    </v-btn>
    <v-dialog v-model="dialogBackup" max-width="600px">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="dialogBackup = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title class="white--text">Click a wallet to create backup</v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <v-list subheader>
            <v-list-tile
              v-for="wallet in wallets"
              :key="wallet.address"
              avatar
              @click="backupWallet(wallet)"
            >
              <v-list-tile-avatar>
                <wallet-image :wallet="wallet" />
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title v-html="wallet.name" />
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import CryptoJS from "crypto-js"

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
      dialogBackup: false
    }
  },
  computed: {
    wallets() {
      return this.$store.state.wallet.wallets
    },
    version() {
      return this.$g("aen.network_version");
    }
  },
  methods: {
    clickBackupWallet() {
      if(Object.keys(this.wallet).length === 0) {
        this.dialogBackup = true
      } else {
        this.backupWallet(this.wallet)
      }
    },
    backupWallet(wallet) {
      let exportName = wallet.name + "-"+wallet.type+"-" + new Date().toISOString().slice(0, 10)
      let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(wallet))
      let downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", exportName + ".json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      // Create an encrypted version of the backup
      let encrypted = "data:application/octet-stream,"+CryptoJS.AES.encrypt(JSON.stringify(wallet), this.$g('salt')).toString()
      var downloadEncryptedAnchorNode = document.createElement("a");
      downloadEncryptedAnchorNode.setAttribute("href", encrypted);
      downloadEncryptedAnchorNode.setAttribute("download", exportName + ".enc");
      document.body.appendChild(downloadEncryptedAnchorNode);
      downloadEncryptedAnchorNode.click();
      downloadEncryptedAnchorNode.remove();

      this.$store.commit("showNotification", {
        type: "info",
        message: 'A plain JSON version and an encrypted version (which can only be read from this program) have requested download'
      })
    }
  }
};
</script>
