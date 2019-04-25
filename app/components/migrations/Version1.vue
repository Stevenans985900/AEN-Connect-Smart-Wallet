<template>
  <v-layout row wrap>
    <v-flex xs12>
      <ul>
        <li v-for="(change, index) in changes" :key="index">
          {{ change }}
        </li>
      </ul>
    </v-flex>
  </v-layout>
</template>

<script>

    function initialDataState() {
        return {
            version: 1,
            changes: [
                "Updating wallet transaction store to minimize memory footprint",
                "Use a reference string for network definition instead of object"
            ]
        }
    }

    export default {
        props: {
            wallet: {
                type: Object,
                required: true
            }
        },
        /**
         * DATA
         * @returns {{dialog: boolean, headers: *[], search: string}}
         */
        data() { return initialDataState() },
        /**
         * MOUNTED
         */
        created: function () {
            const workingWallet = Object.assign({}, this.wallet)

            switch(workingWallet.type) {
                case 'aen':
                    workingWallet.network = 'PUBLIC_TEST'
                    break
                case 'btc':
                    workingWallet.network = 'testnet'
                    break
                case 'eth':
                    workingWallet.network = 'ropsten'
                    break
            }

            // Empty transactions for refresh
            delete workingWallet.transactions
            workingWallet.transactions = {}
            workingWallet.balanceLastSynced = 0
            workingWallet.transactionsLastSynced = 0
            workingWallet.migration_version = this.version
            this.$log.debug('Version1 migration finished for: ' + workingWallet.address)
            this.$emit('complete', workingWallet)
        }
    }
</script>
