<template>
  <span>
    <v-menu offset-y>
      <v-btn slot="activator" color="primary">
        Development
      </v-btn>
      <v-list>
        <v-list-tile @click="dialogWalletControl = true">
          <v-list-tile-title>Wallet Control</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>

    <v-dialog v-model="dialogWalletControl" fullscreen>
      <v-toolbar color="primary">
        <v-btn small fab outline @click="dialogWalletControl = false">
          <v-icon>arrow_back</v-icon>
        </v-btn>
        <v-toolbar-title>Wallet Development Controls</v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-btn
          color="success"
          absolute
          fab
          bottom
          left
          @click="dialogNewContact = true"
        >
          <v-icon>add</v-icon>
        </v-btn>
        <v-card-title>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          />
        </v-card-title>
        <v-data-table :headers="headers" :items="wallets" :search="search">
          <template slot="items" slot-scope="props">
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.address }}</td>
            <td><balance :wallet="props.item" /></td>
            <td>{{ props.item.onChain }}</td>
            <td>{{ props.item.type }}</td>
            <td class="justify-center layout px-0">
              <v-btn small class="mr-2" @click="switchOnChainStatus(props.item)">
                Switch onChain Status
              </v-btn>
              <v-icon small @click="deleteContact(props.item)">
                delete
              </v-icon>
            </td>
          </template>
          <v-alert
            slot="no-results"
            :value="true"
            color="error"
            icon="warning"
          >
            Your search for "{{ search }}" found no results.
          </v-alert>
        </v-data-table>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import Balance from '~/components/Balance'
export default {
  components: { Balance },
  /**
     * DATA
     */
  data() {
    return {
      dialogWalletControl: false,
      search: '',
      headers: [
        {
          text: 'Wallet Name',
          value: 'name'
        },
        {
          text: 'Address',
          value: 'address'
        },
        {
          text: 'Balance',
          value: ''
        },
        {
          text: 'onChain',
          value: 'onChain'
        },
        {
          text: 'Type',
          value: 'type'
        },
        {
          text: 'Actions',
          value: ''
        }
      ]
    }
  },
  /**
     * COMPUTED
     */
  computed: {
    wallets() { return Object.values(this.$store.state.wallet.wallets) }
  },
  /**
     * METHODS
     */
  methods: {
    switchOnChainStatus(wallet) {
      const newCondition = !wallet.onChain
      this.$store.commit('wallet/setWalletProperty', {
        wallet: wallet,
        key: 'onChain',
        value: newCondition
      })
    }
  }
}
</script>
