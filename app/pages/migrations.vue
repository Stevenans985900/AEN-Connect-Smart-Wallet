<template>
  <v-layout row wrap>
    <v-flex xs12 v-for="(wallet, index) in wallets" :key="index">
      <h3>
        {{ index }} - {{ migrationsStatus(wallet) }} - Version: {{ wallet.migration_version || 0 }} of {{ app_migration_version }}
      </h3>
      <wallet-migrate :wallet="wallet" @complete="accountMigrationsCompleted" />
    </v-flex>
    <v-flex v-if="status === 'incomplete'">
      <v-progress-linear :indeterminate="true"></v-progress-linear>
    </v-flex>
    <v-flex v-else>
      <h3>
        Migration Complete
      </h3>
      <p>
        You will shortly be redirected to the dashboard
      </p>
    </v-flex>
  </v-layout>
</template>

<script>
  import WalletMigrate from "~/components/WalletMigrate"

    function initialDataState() {
        return {
            completedMigrations: 0,
            currentMigration: 0,
            status: 'initial',
            migrationComponent: null,
            workingWallet: null
        }
    }
    export default {
      components: { WalletMigrate },

        /**
         * DATA
         * @returns {{dialog: boolean, headers: *[], search: string}}
         */
        data() { return initialDataState() },
        computed: {
          wallets() { return this.$store.state.wallet.wallets },
          local_version: {
              get() { return this.$store.state.runtime.migration_version },
              set(val) { this.$store.commit('RUNTIME_PROP', {key: 'migration_version', value: val} )}
          },
          app_migration_version() { return this.$g('migration_version') }
        },
        watch: {
            completedMigrations(val) {
              if(val === Object.keys(this.wallets).length) {
                this.status = 'complete'
              }
            },
            status(val) {
                console.log('status: ' + val)
              if(val === 'complete') {
                  setTimeout(function(){
                      this.$nuxt.$router.replace({path: '/dashboard'})
                  }.bind(this), 3000);
              }
            }
        },
        methods: {
            accountMigrationsCompleted(processedWallet) {
                this.$log.debug('migrations complete', processedWallet)
                this.$store.commit('wallet/setWallet', processedWallet)
                this.completedMigrations++
            },
            migrationsStatus(wallet) {
                if(!wallet.hasOwnProperty('migration_version')) { return 'INCOMPLETE' }
                return wallet.migration_version === this.app_migration_version ? 'COMPLETE' : 'INCOMPLETE'
            }
        }
    }
</script>
