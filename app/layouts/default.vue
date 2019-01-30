<template>
  <v-app dark>
    <!-- NAV DRAWER -->
    <v-navigation-drawer v-model="drawer" fixed stateless app>
      <v-list>
        <v-list-tile v-for="(item, i) in navigationItems" :to="item.to" :key="i" router exact>
          <v-list-tile-action>
            <v-icon v-html="item.icon"/>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"/>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile v-if="appMode === 'app'" exact @click="exit">
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
      <!--size="24"-->
      <!--<v-avatar >-->
      <v-img src="/logo.png" height="20" contain />
      <!--</v-avatar>-->
      <v-toolbar-title class="hidden-sm-and-down" v-text="title"/>
      <v-spacer/>

      <!-- Environment -->
      <development v-if="environment === 'development'" />

      <network-diagnostics/>
      <backup-wallet v-if="haveWallet" />
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

        <!-- Force the user to agree to the End User license agreement before being able to use the wallet -->
        <v-dialog v-model="dialogEulaAgree" persistent max-width="600px">
          <v-card>
            <v-checkbox v-model="eulaAgree">
              <span slot="label">
                I agree to the
                <a href="http://aencoin.com/eula">AEN EULA</a>
              </span>
            </v-checkbox>
          </v-card>
        </v-dialog>
      </v-container>
    </v-content>

    <!-- FOOTER AREA -->
    <v-footer app height="auto" color="primary">
      <v-toolbar dense>
        <v-toolbar-title>&copy; {{ new Date().getFullYear() }} Aenco Solutions Ltd - Global Health Blockchain Financial Solutions</v-toolbar-title>
        <v-spacer/>
        {{ version }}
      </v-toolbar>
    </v-footer>
  </v-app>
</template>

<script>
import BackupWallet from "~/components/BackupWallet";
import Busy from "~/components/Busy";
import Development from "~/components/Development";
import NetworkDiagnostics from "~/components/NetworkDiagnostics";
import Loading from "~/components/Loading";
import isElectron from "is-electron";
// import childProcess from 'child_process'
if (isElectron()) {
  var execFile = require("child_process").execFile;
  var remote = require("electron").remote;
}

export default {
  /**
   * COMPONENTS
   */
  components: {
    BackupWallet,
    Busy,
    Development,
    Loading,
    NetworkDiagnostics
  },
  /**
   * DATA
   */
  data() {
    return {
      navDrawer: true,
      hydrated: false,
      navigationItems: [
        {
          icon: "apps",
          title: "Dashboard",
          to: "/dashboard"
        },
        {
          icon: "settings_system_daydream",
          title: "Wallet Management",
          to: "/wallet"
        },
        {
          icon: "contacts",
          title: "Address Book",
          to: "/address-book"
        }
        // { icon: 'extension', title: 'Create Namespace', to: '/tokens', requireContext: true }
      ],
      title: "Smart Wallet",
      userMenu: false
    };
  },
  /**
   * COMPUTED
   */
  computed: {
    drawer: {
      get: function() {
        if (this.navDrawer === true && this.eulaAgree === true) {
          return true
        }
      },
      set: function() {}
    },
    dialogEulaAgree() {
      if(this.eulaAgree === false && this.$nuxt.$route.name !== "index") {
        return true
      }
      return false
    },
    eulaAgree: {
      get: function() { return this.$store.state.user.eulaAgree },
      set: function(val) { this.$store.commit('setUserProperty', {
        key: 'eulaAgree',
        value: val
      }) }
    },
    version() { return this.$g("version") },
    appMode() { return this.$store.state.runtime.mode },
    environment() { return this.$store.state.runtime.environment },
    haveWallet() { return this.$store.state.wallet.aen.haveWallet },
    // Functionality enabled / disabled
    runningLocalNode: {
      get: function() { return this.$store.state.electron.runningLocalNode },
      set: function(value) {
        this.$store.commit("setElectronProperty", {
          key: "runningLocalNode",
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
  beforeMount() {
    this.$store.commit("setAppMode", "web");
    let env = process.env.NODE_ENV || "dev";
    this.$store.commit("setRuntimeProperty", {
      key: "environment",
      value: env
    })
    this.$store.commit("setLoading", {
      t: "global",
      v: true,
      m: "Page Startup"
    })
    this.$store.commit("setLoading", {
      t: "page",
      v: false
    })

    // Desktop app setup
    if (isElectron()) {
      this.$store.commit("setAppMode", "app")
      // Electron specific code
      console.log("P:Running from within Electron, checking if system services installed for running Chain Node")
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

    // Check network settings and create a set of defaults based from first available
    // TODO Abstract this defaulting to a component of it's own which can pickup a "wallets available" setting
    if (Object.keys(this.$store.state.wallet.aen.network).length === 0) {
      this.$store.commit('wallet/setAenProperty', {key: 'network', value: this.$g("aen.available_networks")[0] })
    }
    if (Object.keys(this.$store.state.wallet.ethereum.activeApiEndpoint).length === 0) {
      let ethereumNetwork = this.$g('eth.available_networks')[0]
      this.$store.commit('wallet/setEthereumProperty', {key: 'network', value: ethereumNetwork })
      this.$store.commit('wallet/setEthereumProperty', {key: 'activeApiEndpoint', value: ethereumNetwork.infura_api_endpoint })
    }
    if (Object.keys(this.$store.state.wallet.bitcoin.activeApiEndpoint).length === 0) {
      this.$store.commit("wallet/setBitcoinProperty", {
        key: "network",
        value: this.$g("bitcoin.available_networks")[0]
      })
    }
    this.$store.commit("wallet/setBitcoinProperty", {key: "blockCypherEndpoint", value: this.$g("bitcoin.block_cypher.api_endpoint")})
    this.$store.commit("wallet/setBitcoinProperty", {key: "bitapsEndpoint", value: this.$g("bitcoin.bitaps.api_endpoint")})

    this.$store.dispatch("wallet/rankApiNodes")
    setInterval(
      function() {
        this.$store.dispatch("wallet/rankApiNodes")
      }.bind(this),
      this.$g('internal.apiEndpointPingInterval')
    );

    this.$store.dispatch("updateGenericNetworkInformation")
    setInterval(
      function() {
        this.$store.dispatch("updateGenericNetworkInformation")
      }.bind(this),
      this.$g('internal.commonTasksInterval')
    );

    // Short timeout to give API ranking a chance to get some accurate results
    setTimeout(
      function() {
        // Hydrate local state from cold storage
        if (this.$store.state.wallet.aen.haveWallet === false && this.$nuxt.$route.name !== "index") {
            console.log("No wallet so redirecting to launch")
            this.$nuxt.$router.replace({ path: "/" })
        }
        // Finished the global loading procedure
        this.$store.commit("setLoading", { t: "global", v: false })
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
