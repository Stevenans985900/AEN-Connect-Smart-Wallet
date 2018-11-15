# chain-wallet

A NodeJS project providing an easy to use interface to the AENChain blockchain network. This project is based on the following base components:

- [VueJS](https://vuejs.org/) - A modern MVVM Framework from the original creators of Angular (very similar also) who weren't happy about version 2+
- [NUXT](https://nuxtjs.org/) - VueJS workflow system that makes JavaScript development much smoother
- [Electron](https://electronjs.org/) - Cross platform desktop app builder
- [Vuetify](https://vuetifyjs.com/en/) - Google Material Design Component Framework (widget factory)

## TODO

- [] Interface customisation and branding
- [] Optimise asset rendering to shrink package size.
- [] [Cordova](https://cordova.apache.org/) - Middleware for compiling mobile apps based on web projects
- [] Incorporate feedback form
- [] Integrate in app analytics so we can guage usage
- [] Better management panel for namespaces
- [] More details from the mosaic
- [] Replace some of the "out of function" scope variable implementations to use event emitters for better efficiency, smaller footprint, simpler to follow code

If you plan on running both the web app and Electron app, it is necessary to remove the `node_modules` and `.nuxt` path due to the way the Javascript is compiled.

## Getting Started

After checking out the project, `cd` in to the `app` path and run `npm i`. At this point, depending on whether you want to run the project as a web app or electron package, run one of the following.

```
### DEVELOPMENT
# Run through web browser
npm run dev
# Run as app
npm run electron-dev

### Production
# Run through web browser
npm run start
# Package the app for distribution
npm run electron-build
```

## NOTES

The way the wallet sets itself up is defined from a json file in the project root `globals.json`. The following is an example

```
{
    "version": "0.0.1",
    "api_endpoints": [
        {
            "alias": "Master",
            "address": "http://api-1.aencoin.io:3000"
        }
    ],
    "available_networks": [
        {
            "name": "TestNet",
            "identifier": "PUBLIC_TEST",
            "byte": 152
        }
    ],
    "faucets": [
        {
            "name": "TestNet Faucet",
            "address": "TD5C6ZEHS7NOQQQ522VYI4BXJZ33HVJFY5AFAL3P"
        }
    ]
}
```
