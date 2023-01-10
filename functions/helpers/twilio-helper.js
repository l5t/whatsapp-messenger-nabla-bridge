const axios = require('axios');
require('dotenv').config()
const process = require('process');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WA_NUMBER,
} = process.env;
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);


class TwilioHelper {

  static sendMedia = async function (to, mediaUrl) {
    client.messages.create({
      mediaUrl: [mediaUrl],
      from: TWILIO_WA_NUMBER,
      to: to
    })
      .then(message => console.log(message.sid));
  };

  static sendMessage = async function (to, text) {
    client.messages.create({
      body: text,
      from: TWILIO_WA_NUMBER,
      to: to
    })
      .then(message => console.log(message.sid))
      .catch(e => {
        console.log(e);
        callback(e);
      })
      .done();
  };
}

module.exports = TwilioHelper;
