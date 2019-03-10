<template>
  <v-btn outline small @click="manualCheck()">
    <v-icon>
      cloud_off
    </v-icon>
    {{ timeToCheck }}{{ $t('network.message.s_until_next_check') }}
  </v-btn>

</template>

<script>
    export default {
        props: {
            wallet: {
                type: Object,
                default: function() {
                    return {}
                }
            }
        },
        data() {
            return {
              walletOnlineCheckInterval: null,
              nextRun: 999999999,
              timeToCheck: 9999999,
              complete: false
            }
        },
        computed: {
            timeToCheckPercentage() { return (100 / (this.timeToCheck * 1000)) * this.$g('internal.walletCheckInterval') - 100 }
        },
        mounted: function ()  {
            this.checkOnline()
            if(this.wallet.onChain === false) {
                this.nextRun = new Date().getTime() + this.$g('internal.walletCheckInterval')
                this.timeToCheck = Math.round((this.nextRun - new Date().getTime()) / 1000)
                this.walletOnlineCheckInterval = setInterval(
                    function () {
                        let nowTime = new Date().getTime()
                        if(this.nextRun < nowTime) {
                            this.checkOnline()
                            this.nextRun = nowTime + this.$g('internal.walletCheckInterval')
                        }
                        this.timeToCheck = Math.round((this.nextRun - nowTime) / 1000)
                    }.bind(this),
                    5000
                )
            }
        },
        methods: {
            manualCheck: function () {
                this.nextRun = new Date().getTime() + this.$g('internal.walletCheckInterval')
                this.timeToCheck = (this.nextRun - new Date().getTime()) / 1000
                this.checkOnline()
            },
            checkOnline: function () {
                this.$store.dispatch('wallet/getLiveWallet', this.wallet).then((response) => {
                   if (response !== false) {
                        if(this.walletOnlineCheckInterval)  { clearInterval(this.walletOnlineCheckInterval) }

                        if(this.$store.state.wallet.wallets[this.wallet.address].onChain === false) {
                            this.$store.commit('wallet/setWalletProperty', {
                                address: this.wallet.address,
                                key: 'onChain',
                                value: true
                            })
                        }
                        this.$store.dispatch('wallet/balance', this.wallet)
                    }
                })

            }
        }
    }
</script>
