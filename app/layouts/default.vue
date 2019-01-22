<template>
  <v-app dark>
    <!-- NAV DRAWER -->
    <v-navigation-drawer v-model="drawer" fixed stateless app>
      <v-list>
        <v-list-tile v-for="(item, i) in visibleLinks" :to="item.to" :key="i" router exact>
          <v-list-tile-action>
            <v-icon v-html="item.icon"/>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"/>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile v-if="appRunTime === 'app'" exact @click="exit">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Exit</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <!-- TOP BAR -->
    <v-toolbar fixed app>
      <v-toolbar-side-icon v-if="eulaAgree" @click="navDrawer = !navDrawer"/>
      <v-avatar size="24">
        <img src="/logo.png" alt="avatar">
      </v-avatar>
      <v-toolbar-title class="hidden-sm-and-down" v-text="title"/>

      <v-spacer/>

      <!-- Environment -->
      <v-btn v-if="environment !== 'production'" disabled>{{ environment }}</v-btn>

      <network-diagnostics/>

      <!-- USER DROPDOWN -->
      <v-menu v-if="contextWallet.address !== ''" v-model="menu" :close-on-content-click="false">
        <v-btn slot="activator" flat>
          <v-avatar size="24">
            <v-icon>account_circle</v-icon>
          </v-avatar>
        </v-btn>
        <v-card>
          <v-card-title>
            <div>
              <span class="grey--text">{{ contextWallet.name }}</span>
              <br>
              <address-render :address="contextWallet.address"/>
              <v-list>
                <v-list-tile v-if="mode === 'app'">
                  <v-list-tile-action>
                    <v-switch v-model="local_node"/>
                  </v-list-tile-action>
                  <v-list-tile-title>Local Node</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </div>
          </v-card-title>
          <v-card-actions>
            <backup-wallet :wallet="contextWallet"/>
            <v-btn flat nuxt to="/dashboard">Dashboard</v-btn>
            <v-spacer/>
            <v-btn v-if="mode === 'app'" flat @click="exit">Exit</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-toolbar>

    <!-- MAIN CONTENT AREA -->
    <v-content>
      <v-container fluid>
        <no-ssr>
          <loading/>
        </no-ssr>
        <no-ssr>
          <busy />
        </no-ssr>
        <v-snackbar v-model="showNotification" :timeout="timeout" :top="true" :vertical="true">
          {{ notification_message }}
          <v-btn flat @click="showNotification = false">Close</v-btn>
        </v-snackbar>
        <!-- NUXT BEGINNING -->
        <nuxt/>
      </v-container>
    </v-content>

    <!-- FOOTER AREA -->
    <v-footer app height="auto" color="primary">
      &copy; {{ new Date().getFullYear() }} Aenco Solutions Ltd - Global Health Blockchain Financial Solutions
      <v-spacer/>
      {{ version }}
    </v-footer>
  </v-app>
</template>

<script>
import BackupWallet from "~/components/BackupWallet";
import Busy from "~/components/Busy";
import NetworkDiagnostics from "~/components/NetworkDiagnostics";
import Loading from "~/components/Loading";
import isElectron from "is-electron";
// import childProcess from 'child_process'
if (isElectron()) {
  var execFile = require("child_process").execFile;
  var remote = require("electron").remote;
}

export default {
  components: {
    BackupWallet,
    Busy,
    Loading,
    NetworkDiagnostics
  },
  data() {
    return {
      navDrawer: true,
      hydrated: false,
      walletCheckIntervals: [],
      items: [
        {
          icon: "apps",
          title: "Dashboard",
          to: "/dashboard",
          requireContext: true
        },
        {
          icon: "settings_system_daydream",
          title: "Wallet Management",
          to: "/wallet"
        },
        {
          icon: "contacts",
          title: "Address Book",
          to: "/address-book",
          requireContext: true
        }
        // { icon: 'extension', title: 'Create Namespace', to: '/tokens', requireContext: true }
      ],
      title: "AENChain Wallet",
      menu: false
    };
  },
  computed: {
    drawer: {
      get: function() {
        if (this.navDrawer === true && this.$store.state.meta.eulaAgree === true) {
          return true
        }
      },
      set: function() {}
    },
    eulaAgree() { return this.$store.state.meta.eulaAgree },
    version() {
      return this.$g("version");
    },
    contextWallet() {
      return this.$store.state.wallet.context;
    },
    haveWallets() {
      if(Object.keys(this.$store.state.wallet.context).length > 0) {
        return true
      }
    },
    appRunTime() {
      return this.$store.state.meta.mode;
    },
    /**
     * Determine what links should be shown in the main bar
     */
    visibleLinks() {
      if (this.$store.state.wallet.context.address !== "") {
        return this.items;
      }
      let map = this.items.filter(a => {
        if (!a.hasOwnProperty("requireContext")) {
          return a;
        }
      });
      return map;
    },
    environment() {
      return this.$store.state.meta.environment;
    },
    mode: {
      get: function() {
        return this.$store.state.meta.mode;
      },
      set: function() {}
    },
    // Functionality enabled / disabled
    local_node: {
      get: function() {
        return this.$store.state.settings.local_node;
      },
      set: function(value) {
        this.$store.commit("setDeviceSetting", {
          key: "local_node",
          value: value
        });
      }
    },
    // notification details
    showNotification: {
      get: function() {
        return this.$store.state.notification.show;
      },
      set: function(status) {
        this.$store.commit("setNotificationStatus", status);
      }
    },
    timeout() {
      return this.$store.state.notification.timeout;
    },
    notification_type() {
      return this.$store.state.notification.type;
    },
    notification_message() {
      return this.$store.state.notification.message;
    }
  },
  /**
   *
   */
  mounted() {
    this.$store.commit("setAppMode", "web");
    let env = process.env.NODE_ENV || "dev";
    this.$store.commit("setEnvironment", env);

    this.$store.commit("setLoading", {
      t: "global",
      v: true,
      m: "Page Startup"
    });
    this.$store.commit("setLoading", {
      t: "page",
      v: false
    });

    // Desktop app setup
    if (isElectron()) {
      this.$store.commit("setAppMode", "app");
      // Electron specific code
      console.log(
        "P:Running from within Electron, checking if system services installed for running Chain Node"
      );
      const child = execFile("docker", ["-v"], (error, stdout, stderr) => {
        if (error) {
          console.error("stderr", stderr);
          throw error;
        }
        if (stdout.startsWith("Docker version")) {
          console.log("P:Docker can be controlled by Electron");
          this.$store.commit("setElectronProperty", { docker_present: true });
        }
      });
      console.log(child);
    }

    // Check if there is a network set and use the first available
    if (Object.keys(this.$store.state.wallet.context.network).length === 0) {
      this.network = this.$g("aen.available_networks")[0];
    }

    if (Object.keys(this.$store.state.wallet.ethereum.activeApiEndpoint).length === 0) {
      console.log('setting ethereum network to first available')
      console.log(this.$g('eth.available_networks')[0])
      let ethereumNetwork = this.$g('eth.available_networks')[0]
      this.$store.commit('wallet/setEthereumProperty', {key: 'network', value: ethereumNetwork })
      this.$store.commit('wallet/setEthereumProperty', {key: 'activeApiEndpoint', value: ethereumNetwork.infura_api_endpoint })
    }

    if(this.$store.state.wallet.context.address !== '' && this.$store.state.wallet.context.onChain === false) {
      let walletCheckInterval = setInterval(
        function() {
          this.$store.dispatch('wallet/checkWalletLive', this.$store.state.wallet.context).then(response => {
            this.$store.commit('wallet/setProperty', {
              type: 'aen',
              address: this.$store.state.wallet.context.address,
              key: 'onChain',
              value: response
            });
            if (response === true) {
              clearInterval(walletCheckInterval)
            }
          })
        }.bind(this),
        this.$g('internal.walletCheckInterval')
      );
    }

    this.$store.dispatch("wallet/rankApiNodes");
    setInterval(
      function() {
        this.$store.dispatch("wallet/rankApiNodes");
        this.$walletService.updateApiEndpoint("aen", {
          address: this.$store.state.internal.activeApiEndpoint
        });
      }.bind(this),
      this.$g('internal.apiEndpointPingInterval')
    );

    this.$store.dispatch("updateGenericNetworkInformation");
    setInterval(
      function() {
        this.$store.dispatch("updateGenericNetworkInformation");
      }.bind(this),
      this.$g('internal.commonTasksInterval')
    );

    // Short timeout to give API ranking a chance to get some accurate results
    setTimeout(
      function() {
        // Hydrate local state from cold storage
        if (this.$store.state.wallet.context.accountPrivateKey === "") {
          if (this.$nuxt.$route.name !== "index" && this.haveWallets) {
            console.log("No wallet so redirecting to launch");
            this.$nuxt.$router.replace({ path: "/" });
          }
        }

        // Finished the global loading procedure
        this.$store.commit("setLoading", { t: "global", v: false });
      }.bind(this),
      2000
    );
  },
  methods: {
    /**
     * Shutdown procedure
     */
    exit() {
      console.debug("F:E:Exit");

      // Check if the user doesn't want to be remembered and reset the state machine
      if (this.$store.state.meta.rememberUser === false) {
        this.$store.commit("reset");
        console.debug("E:Resetting state machine");
      }

      // If running the smart wallet as an app which has a window which can be closed
      if (this.$store.state.meta.mode === "app") {
        console.debug("E:Closing window");
        var window = remote.getCurrentWindow();
        window.close();
      }
    }
  }
};
</script>
