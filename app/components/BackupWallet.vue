<template>
  <v-btn class="success" @click="backupWallet">
    Backup Wallet
  </v-btn>
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
  computed: {
    version() {
      return this.$g("aen.network_version");
    }
  },
  methods: {
    backupWallet() {
      console.debug("F:BW:Backup Wallet");

      var exportName =
        this.wallet.name + "-backup-" + new Date().toISOString().slice(0, 10);

      console.debug("BW:Data to be backed up");
      console.debug(this.wallet);

      // Create hidden download anchor and handle for the user
      var dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(this.wallet));
      var downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", exportName + ".json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      // Create an encrypted version of the backup
      let encrypted = "data:application/octet-stream,"+CryptoJS.AES.encrypt(JSON.stringify(this.wallet), this.$g('salt')).toString()
      console.log(encrypted)
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
