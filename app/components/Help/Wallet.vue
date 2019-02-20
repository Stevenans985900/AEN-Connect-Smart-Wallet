<template>
  <v-layout row wrap>
    <v-flex xs12 md7>
      <v-toolbar>
        <v-toolbar-title>
          Wallet Management
        </v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <p>
            From this page you can manage one or more wallets, a portfolio of sorts. The first time you visit this page,
            there will only be a single wallet on the AENC network present but, it is possible to add wallets which work
            on both the Ethereum (including smart contracts) and Bitcoin network also.
          </p>
          <v-expansion-panel>
            <v-expansion-panel-content
              v-for="(faqQuestion, index) in faq"
              :key="index"
            >
              <div slot="header">
                {{ faqQuestion.title }}
              </div>
              <v-card>
                <v-card-text>
                  {{ faqQuestion.content }}
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs12 md5>
      <v-card>
        <youtube video-id="xwftD2aehpM" player-width="100%" />
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      faq: [
        {
          title: 'Adding another wallet',
          content: 'A guide on adding wallet.'
        },
        {
          title: 'Why can\'t I add smart contracts?',
          content: 'A guide on adding smart contracts'
        },
        {
          title: 'I removed a wallet and want to restore it',
          content: 'If you have a backup file, know the private key, etc.'
        }
      ]
    }
  }
}
</script>
