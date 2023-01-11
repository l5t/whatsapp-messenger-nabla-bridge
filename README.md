# whatsapp-messenger-nabla-bridge

This repo contains functions which handle the whatsapp and messenger integration. You can deploy it directly to Netlify.

You will need the following Nabla keys from the Nabla Console developers section

- NABLA_API_KEY: you can create one in the Nabla Console (/developers/api-keys/server)
- NABLA_API_SECRET_KEY: you will get one when you create your webhook in the Nabla Console (/developers/webhooks)

### Messenger bridge

To build a Messenger bridge in a few minutes, follow [this guide](https://gist.github.com/l5t/674b4ab951e8171031499e15aa5558f7) to get the following info

- MESSENGER_ACCESS_TOKEN
- MESSENGER_VERIFY_TOKEN
- PAGE_ACCESS_TOKEN only if you want to use the Persona API to display the name and profile picture of the Nabla provider ([This is currently available only outside of EU and Japan](https://developers.facebook.com/docs/messenger-platform/europe-japan-updates))

### WhatsApp bridge

To build a WhatsApp bridge in a few minutes, you will need these info from Twilio. Note that you can use [Whatsapp directly](https://developers.facebook.com/docs/whatsapp/cloud-api) or another [Business Solution Provider](https://www.facebook.com/business/partner-directory/search?solution_type=messaging&platforms=whatsapp).

- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_WA_NUMBER

## Deploy to Netlify

You can deploy this bridge as a Netlify function by clicking this button.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/l5t/whatsapp-messenger-nabla-bridge)

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

Or link your the current folder to an existing Netlify project with `netlify link` to retrieve these env variables directly from Netlify (see deploy below).

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
