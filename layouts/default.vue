<template>
  <v-app dark>

    <!-- NAV DRAWER -->
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
    >
      <v-list>
        <v-list-tile
          router
          :to="item.to"
          :key="i"
          v-for="(item, i) in items"
          exact
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

		<!-- TOP BAR -->
    <v-toolbar fixed app>
      <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
      <v-avatar
        size="35"
      >
        <img src="/logo.png" alt="avatar">
      </v-avatar>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>

			<!-- USER DROPDOWN -->
      <v-menu
        v-if="account"
        v-model="menu"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-x
      >
        <v-btn color="blue" dark slot="activator">
          User &nbsp;
          <v-icon small>build</v-icon>
        </v-btn>

        <v-card>
          <v-list>
            <v-list-tile avatar>
              <v-list-tile-avatar>
                <img src="/logo.png" alt="John">
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title v-if="account.wallet.name">{{ account.wallet.name }}</v-list-tile-title>
                <v-list-tile-sub-title v-if="account.account.address">{{ account.account.address.address }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>

          <v-divider></v-divider>

          <v-list>
            <v-list-tile>
              <v-list-tile-action>
                <v-switch v-model="local_node"></v-switch>
              </v-list-tile-action>
              <v-list-tile-title>Local Node</v-list-tile-title>
            </v-list-tile>


            <v-card-actions>
              <v-btn flat nuxt to="/dashboard">Dashboard</v-btn>
              <v-spacer></v-spacer>
              <v-btn flat>Exit</v-btn>
            </v-card-actions>
          </v-list>
        </v-card>
      </v-menu>
		</v-toolbar>

		<!-- MAIN CONTENT AREA -->
		<v-content>
			<v-container>
				<nuxt />
			</v-container>
		</v-content>

		<!-- FOOTER AREA -->
    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
	</v-app>
</template>

<script>
export default {
	computed: {
		account () { return this.$account.$store.state }
	},
	data () {
		return {
			drawer: false,
			hydrated: false,
			items: [
				{ icon: 'apps', title: 'Dashboard', to: '/dashboard' },
				{ icon: 'account_balance_wallet', title: 'Ledger', to: '/ledger' },
				{ icon: 'contacts', title: 'Address Book', to: '/address-book' }
			],
			title: 'AENChain Wallet',
			menu: false,
		}
	}
}
</script>
