# whatsapp-messenger-nabla-bridge

This repo contains functions which handle the whatsapp and messenger integration

## Install

- `npm install netlify-cli -g`
- `npm install axios`
- `npm install dotenv`
- `npm install process`
- `npm install twilio`

## Run

Either do this

- `export NABLA_API_KEY="<NABLA_API_KEY>"`
- `export NABLA_API_SECRET_KEY="<NABLA_API_SECRET_KEY>"`
- `export TWILIO_ACCOUNT_SID="<TWILIO_ACCOUNT_SID>"`
- `export TWILIO_AUTH_TOKEN="<TWILIO_AUTH_TOKEN>"`
- `export TWILIO_WA_NUMBER="<TWILIO_WA_NUMBER>"`
- `export MESSENGER_ACCESS_TOKEN="<MESSENGER_ACCESS_TOKEN>"`
- `export MESSENGER_VERIFY_TOKEN="<MESSENGER_VERIFY_TOKEN>"`
- `export PAGE_ACCESS_TOKEN="<PAGE_ACCESS_TOKEN>"`

Or link your the current folder to an existing Netlify project with `netlify link` (see deploy below)

- `netlify dev`
- The above command will output `Function server is listening on <PORT>`
- To run a function, make a POST request to `http://localhost:<PORT>/<FUNCTION>`
- Available functions are:
  - `nabla`:
  - `messenger`
  - `whatsapp`

## Expose your local server to test your code

- Install ngrok if not yet installed: `npm install ngrok -g`
- Define a specific port for the local netlify server: `netlify dev --functionsPort=8885`
- Create a ngrok tunnel for this specific port: `ngrok http 8885`

## Create webhook subscriptions

- [Twilio for WhatsApp](https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox?frameUrl=%2Fconsole%2Fsms%2Fwhatsapp%2Fsandbox%3Fx-target-region%3Dus1)
- [Messenger](https://developers.facebook.com/docs/messenger-platform/webhooks)
- [Nabla](https://docs.nabla.com/reference/setting-up-webhooks)

## Deploy

- `netlify deploy --functions=functions --prod`
- When asked by the CLI which directory to publish to, answer with `.`
