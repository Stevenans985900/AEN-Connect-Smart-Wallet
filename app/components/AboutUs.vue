<template>
  <v-layout row wrap justify-center align-center class="text-xs-center">
    <v-flex xs12 md6 class="mt-4">
      <v-img src="/logo-800.png" contain />
      <h1>AENCo Smart Connect Wallet</h1>
      <h2>Version: {{ version }}#{{ build }}</h2>
      <p>
        Aenco is a "one stop shop" for the delivery of cutting edge institutional financing, prime brokerage, and smart capital solutions for the HealthTech industry, as well as a research and collaboration hub for healthcare companies and projects involved in the field of blockchain development.
      </p>
      <p>
        Aenco will be combining its solutions platform and core financing ecosystem with the wider community, through the AEN token, as the key ecosystem building block and extensions across all its service and community deliveries.
      </p>
      <h3>Feedback</h3>
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