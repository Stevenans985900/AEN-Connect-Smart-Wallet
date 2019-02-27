<template>
  <v-expansion-panel>
    <v-expansion-panel-content>
      <div slot="header">Create a primary AEN Wallet</div>
      <v-card>
        <v-card-text>
          <p>
            Choose to Create a new wallet right now and click continue
            <img src="/help/introduction_getting-started_choose-wallet-add.png" />
          </p>
          <p>
            Enter a name for the wallet and a password (repeating the password for verification) that is at least 8 characters
            long. There is a password strength meter that will change as you type to indicate how secure your password is from
            attack
            <img src="/help/introduction_getting-started_wallet-name-password.png" />
          </p>
          <p>
            With your wallet created, you will be shown a screen instructs you to to back up your wallet. This step is optional
            (yet highly recommended), backing up a wallet will download two files for you. A plain text JSON file and an
            encoded version which can only be read by this app. Whether you backup your wallet or not, it is necessary to check
            the box indicating that you understand keeping your wallet information safe is your responsibility, AEN does not
            store any information about your wallet. Following this prompt is information about your newly created wallet.
          </p>
          <ul>
            <li>Your address which, if clicked on will copy the address to clipboard</li>
            <li>Your private key in masked format. To reveal the private key, click the eye icon</li>
            <li>Your address in QR code format</li>
          </ul>
          <img src="/help/introduction_getting-started_wallet-review.png" />
        </v-card-text>
      </v-card>
    </v-expansion-panel-content>

    <v-expansion-panel-content>
      <div slot="header">Choosing Security Features</div>
      <v-card>
        <v-card-text>
          <p>
            Rather than forcing you to work in just one way, we believe it is important to let you be awesome in the way you
            want. As such, there is a global security policy setting which determines the amount of challenges you will face
            when performing certain actions. For the sake of this guide, we'll use default settings.
          </p>
          <img src="/help/introduction_getting-started_security-selection.png" />
        </v-card-text>
      </v-card>
    </v-expansion-panel-content>

    <v-expansion-panel-content>
      <div slot="header">Accept End User License Agreement</div>
      <v-card>
        <v-card-text>
          <p>
            The final thing to do is accept the EULA, at which point you'll be sent to your wallet management page.
          </p>
          <p>
            If you've made a wallet on the test net, you will be prompted whether or not you'd like to receive some tokens to
            get started from the Faucet. Clicking the faucet button will take you to an external service, populating the
            required fields for you in the process meaning, you only have to click the claim button.
          </p>
          <img src="/help/introduction_getting-started_eula.png" />
        </v-card-text>
      </v-card>
    </v-expansion-panel-content>

  </v-expansion-panel>
</template>