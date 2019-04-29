<template>
  <span>
    <component :is="migrationComponent" v-if="migrationComponent" :wallet="workingWallet" @complete="migrationCompleted" />
  </span>
</template>

<script>
  import BackupWallet from "~/components/BackupWallet"

    function initialDataState() {
        return {
            trackedMigrationVersion: 1,
            currentMigration: 0,
            status: 'initial',
            migrationComponent: null,
            workingWallet: null
        }
    }
    export default {
      components: { BackupWallet },
        props: {
          wallet: {
              type: Object,
              default: null
          }
        },
        /**
         * DATA
         * @returns {{dialog: boolean, headers: *[], search: string}}
         */
        data() { return initialDataState() },
        computed: {
          local_version: {
              get() { return this.$store.state.runtime.migration_version },
              set(val) { this.$store.commit('RUNTIME_PROP', {key: 'migration_version', value: val} )}
          },
          app_migration_version() { return this.$g('migration_version') }
        },
        watch: {
          // Watch to check if all migrations have been run
          trackedMigrationVersion: function(versionNumber) {
              console.log(versionNumber)
              if(versionNumber === this.app_migration_version) {
                  this.status = 'complete'
                  this.$emit('complete', this.workingWallet)
              } else {
                  this.runMigration()
              }
          }
        },
        created: function() {
          // If the component is being loaded to run migrations on only a single wallet, execute that pipeline
          this.workingWallet = Object.assign({}, this.wallet)
          this.trackedMigrationVersion = 1
          if(this.workingWallet.hasOwnProperty('migration_version')) {
              if (this.workingWallet.migration_version !== 0) {
                  this.trackedMigrationVersion = this.workingWallet.migration_version
              }
          }
            this.workingWallet.migration_version = this.trackedMigrationVersion
          if (this.workingWallet.migration_version === this.app_migration_version) {
              this.$emit('complete', this.workingWallet)
          } else {
              this.runMigration()
          }
        },
        methods: {
            migrationCompleted(processedWallet) {
                this.$log.debug('caught migration completion', processedWallet)
                this.workingWallet = processedWallet
                this.trackedMigrationVersion++
            },
            runMigration() {
                this.migrationComponent = () => import('~/components/migrations/Version' + this.trackedMigrationVersion)
                    .catch(function () {
                        this.$emit('complete', this.workingWallet)
                    }.bind(this))
            }
        }
    }
</script>
