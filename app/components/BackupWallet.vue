<template>
  <v-btn class="success" @click="backupWallet">Backup Wallet</v-btn>
</template>

<script>
export default {
  computed: {
    version() {
      return this.$g("aen.network_version");
    }
  },
  methods: {
    backupWallet() {
      console.debug("F:BW:Backup Wallet");
      // Encode the current state data
      var exportData = {
        // Include software version in case there are any wallet updates needed to do later
        publisherVersion: this.version,
        name: this.$account.$store.state.wallet.name,
        address: this.$account.$store.state.wallet.address.address,
        networkIdentifierByte: this.$account.$store.state.wallet.network,
        accountPublicKey: this.$account.$store.state.account.publicKey,
        accountPrivateKey: this.$account.$store.state.account.privateKey,
        walletEncryptedPrivateKey: this.$account.$store.state.wallet
          .encryptedPrivateKey.encryptedKey
      };
      var exportName =
        exportData.name + "-backup-" + new Date().toISOString().slice(0, 10);
      console.debug("BW:Data to be backed up");
      console.debug(exportData);

      // Create hidden download anchor and handle for the user
      var dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(exportData));
      var downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", exportName + ".json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  }
};
</script>
