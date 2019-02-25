<template>
  <span>
    <v-btn @click="manualCheck()">
      {{ $t('common.action.refresh') }}
    </v-btn>
    {{ timeToCheck }}{{ $t('network.message.s_until_next_check') }}
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
                this.$store.commit('setLoading', {
                    t: 'page',
                    v: true,
                    m: this.$t('wallet.message.checking_wallet_status')
                })
                this.$store.dispatch('wallet/getLiveWallet', this.wallet).then((response) => {
                    this.$store.commit('setLoading', {
                        t: 'page',
                        v: false
                    })
                    if (response !== false) {
                        if(this.walletOnlineCheckInterval)  { clearInterval(this.walletOnlineCheckInterval) }

                        if(this.$store.state.wallet.wallets[this.wallet.address].onChain === false) {
                            this.$store.commit('wallet/setWalletProperty', {
                                address: this.wallet.address,
                                key: 'onChain',
                                value: true
                            })
                        }
                        // Update the balance for first time
                        this.$store.commit('setLoading', {
                          t: 'page',
                          v: true,
                          m: this.$t('wallet.message.updating_balance')
                        })
                        this.$store.dispatch('wallet/balance', this.wallet).then(() => {
                          this.$store.commit('setLoading', {
                            t: 'page',
                            v: false
                          })
                        })

                    }
                })
                    .catch(() => {
                        this.$store.commit('setLoading', {
                            t: 'page',
                            v: false
                        })
                    })
            }
        }
    }
</script>
