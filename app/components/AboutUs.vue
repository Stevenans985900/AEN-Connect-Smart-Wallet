<template>
  <v-layout row wrap justify-center align-center class="text-xs-center">
    <v-flex xs12 md6 class="mt-4">
      <v-img src="/logo-800.png" contain />
      <h1>{{ $t('common.label.app_name') }}</h1>
      <h2>{{ $t('common.label.version') }}: {{ version }}#{{ build }}</h2>
      <p>{{ $t('aen.message.about_aenc') }}</p>
      <h3>{{ $t('common.label.feedback') }}</h3>
      <p>
        <a href="mailto:moon@aencoin.com">
          moon@aencoin.com
        </a>
      </p>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    computed: {
      version() { return this.$g('version') },
      build() { return this.$g('build_number') }
    }
  }
</script>
