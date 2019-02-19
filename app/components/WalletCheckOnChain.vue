<template>
  <span>
    <v-btn @click="manualCheck()">
      Check
    </v-btn>
    <v-progress-circular
      v-if="wallet.onChain === false"
      :rotate="180"
      :size="35"
      :width="3"
      :value="timeToCheckPercentage"
      color="secondary"
    >
      {{ timeToCheck }}
    </v-progress-circular>
  </span>
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
            timeToCheckPercentage() { return (100 / this.$g('internal.walletCheckInterval')) * (this.timeToCheck * 1000) }
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
                        this.$store.commit('wallet/setWalletProperty', {
                            address: this.wallet.address,
                            key: 'onChain',
                            value: true
                        })
                        if(this.complete === false) {
                            this.$store.commit('showNotification', {
                                type: 'success',
                                message: 'The wallet is recognised on the blockchain'
                            })
                            this.complete = true
                        }
                    }
                })
            }
        }
    }
</script>
