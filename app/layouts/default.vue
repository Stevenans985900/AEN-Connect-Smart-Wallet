<template>
  <v-app dark>
    <!-- NAV DRAWER -->
    <v-navigation-drawer v-model="drawer" fixed app>
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
      <v-toolbar-side-icon @click="drawer = !drawer"/>
      <v-avatar size="24">
        <img src="/logo.png" alt="avatar">
      </v-avatar>
      <v-toolbar-title class="hidden-sm-and-down" v-text="title"/>

      <v-spacer/>

      <!-- Environment -->
      <v-btn v-if="environment !== 'production'" disabled>{{ environment }}</v-btn>

      <!-- Quick balance display -->
      <v-btn v-if="account.meta.balance != 0" disabled>Balance: {{ account.meta.balance }}</v-btn>

      <network-diagnostics/>

      <!-- USER DROPDOWN -->
      <v-menu v-if="account.account.address" v-model="menu" :close-on-content-click="false">
        <v-btn slot="activator" flat>
          <v-avatar size="24">
            <v-icon>account_circle</v-icon>
          </v-avatar>
        </v-btn>
        <v-card>
          <v-card-title>
            <div>
              <span v-if="account.wallet.name" class="grey--text">{{ account.wallet.name }}</span>
              <br>
              <span v-if="account.wallet.address.address">
                <address-render :address="account.wallet.address.address"/>
              </span>
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
            <backup-wallet/>
            <v-btn flat nuxt to="/dashboard">Dashboard</v-btn>
            <v-spacer/>
            <v-btn v-if="mode === 'app'" flat @click="exit">Exit</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-toolbar>

    <!-- MAIN CONTENT AREA -->
    <v-content>
      <v-container>
        <no-ssr>
          <loading/>
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
import BackupWallet from "../components/BackupWallet";
import NetworkDiagnostics from "../components/NetworkDiagnostics";
import Loading from "../components/Loading";
import isElectron from "is-electron";
// import childProcess from 'child_process'
if (isElectron()) {
  var execFile = require("child_process").execFile;
  var remote = require("electron").remote;
}

export default {
  components: {
    BackupWallet,
    Loading,
    NetworkDiagnostics
  },
  data() {
    return {
      drawer: false,
      hydrated: false,
      items: [
        {
          icon: "settings_system_daydream",
          title: "Wallet Management",
          to: "/wallet"
        },
        {
          icon: "apps",
          title: "Dashboard",
          to: "/dashboard",
          requireLogged: true
        },
        {
          icon: "account_balance_wallet",
          title: "Ledger",
          to: "/ledger",
          requireLogged: true
        },
        {
          icon: "contacts",
          title: "Address Book",
          to: "/address-book",
          requireLogged: true
        }
        // { icon: 'extension', title: 'Create Namespace', to: '/tokens', requireLogged: true }
      ],
      title: "AENChain Wallet",
      menu: false
    };
  },
  computed: {
    version() {
      return this.$g("version");
    },
    appRunTime() {
      return this.$store.state.meta.mode;
    },
    visibleLinks() {
      if (this.$store.state.meta.wallet_present === true) {
        return this.items;
      }
      var map = this.items.filter(a => {
        if (!a.hasOwnProperty("requireLogged")) {
          return a;
        }
      });
      return map;
    },
    account() {
      return this.$walletService.$store.state;
    },
    currentPing() {
      return this.$store.state.internal.activeApiPing;
    },
    currentApi() {
      return this.$store.state.internal.activeApiEndpoint;
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
  watch: {
    hydrated: function() {
      console.debug("W:H:Hydrated");
      // Ping network until address is considered reachable
      if (this.$store.state.account.publicly_accessible === false) {
        var addressInterval = setInterval(
          function() {
            var result = this.$walletService.isWalletLive(
              'aen',
                    {
                      address: this.$store.state.activeWallet.address
                    }

            );
            if (result !== false) {
              console.debug(
                "H:Address (" +
                  this.$store.state.account.address +
                  ") is on the network"
              );
              this.$store.commit("setAccountProperty", {
                key: "publicly_acessible",
                value: true
              });
              this.$walletService.taskRunners();
              this.$walletService.startListeners();
              clearInterval(addressInterval);
            }
          }.bind(this),
          5000
        );
      }
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

    this.$store.dispatch("rankApiNodes");

    // Short timeout to give API ranking a chance to get some accurate results
    setTimeout(
      function() {
        // Local services for network consumption. Only recreates if new or using different
        this.$walletService.Aen.updateActiveApiEndpoint({
          address: this.$store.state.internal.activeApiEndpoint
        }
        );

        // Hydrate local state from cold storage
        if (this.$store.state.activeWallet.accountPrivateKey) {
          console.debug(
            "Local wallet information found, attempting warmup"
          );
          this.$walletService.walletLoad(
                  'aen',
                  {
                    accountPrivateKey: this.$store.state.activeWallet.accountPrivateKey,
                    network: this.$store.state.activeWallet.network,
                    name: this.$store.state.activeWallet.name,
                    password: this.$store.state.activeWallet.password,
                  }
          );
          // Regularly run checks on the current wallet until it is considered live
          this.$walletService.walletIsLive(
                  'aen',
                  {
                    address: this.$store.state.activeWallet.address
                  }

          )
          let walletOnChainCheckInterval = setInterval(
            function() {
              this.$walletService.walletIsLive(
                'aen',
                      {
                        address: this.$store.state.activeWallet.address
                      }

              )
              if (this.$walletService.$store.state.onChain === true) {
                clearInterval(walletOnChainCheckInterval);
              }
            }.bind(this),
            40000
          );

          // User doesn't yet have an AEN wallet so redirect to initial setup screen
        } else {
          if (this.$nuxt.$route.name !== "index") {
            console.log("No wallet so redirecting to launch");
            this.$nuxt.$router.replace({ path: "/" });
          }
        }

        // API Node ping test / ranking
        setInterval(
          function() {
            this.$store.dispatch("rankApiNodes");
            this.$walletService.Aen.updateActiveApiEndpoint({
              address: this.$store.state.internal.activeApiEndpoint
            }

            );
          }.bind(this),
          120000
        );

        // Generic network information that can be had without an account
        this.$store.dispatch("updateGenericNetworkInformation");
        setInterval(
          function() {
            this.$store.dispatch("updateGenericNetworkInformation");
          }.bind(this),
          80000
        );

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
