require('dotenv').config();
const axios = require("axios");

const {
  MESSENGER_ACCESS_TOKEN,
  MESSENGER_VERIFY_TOKEN,
  PAGE_ACCESS_TOKEN,
} = process.env;

const MESSENGER_GRAPHQL_ENDPOINT = `https://graph.facebook.com/v2.6/me/messages?access_token=${MESSENGER_ACCESS_TOKEN}`;
const FACEBOOK_IDENTITY_URL = `https://graph.facebook.com/`;
const FACEBOOK_IDENTITY_ENDPOINT = `?fields=first_name,last_name,profile_pic&access_token=${MESSENGER_ACCESS_TOKEN}`;
const MESSENGER_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json"
};


class MessengerHelper {

  // To verify Messenger webhook
  static verifyRequest = async function (event) {
    if (event.rawQuery) {
      const payload = new URLSearchParams(event.rawQuery);

      var queryParams = payload;

      // Parse the query params
      let mode = queryParams.get("hub.mode");
      let token = queryParams.get("hub.verify_token");
      let challenge = queryParams.get("hub.challenge");

      // Check if a token and mode is in the query string of the request
      if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === "subscribe" && token === MESSENGER_VERIFY_TOKEN) {
          // Respond with the challenge token from the request
          console.log("WEBHOOK_VERIFIED");
          return {
            statusCode: 200,
            body: challenge
          };
        } else {
          // Respond with '403 Forbidden' if verify tokens do not match
          console.log("WEBHOOK_NOTVERIFIED");
          return {
            statusCode: 403,
          };
        }
      }
    }
  };

  static sendTextMessage = async function (senderFbId, text, persona_id) {
    const body = {
      "recipient": { id: senderFbId },
      "messaging_type": "response",
      "message": { text: text }
    };
    if (persona_id)
      body.persona_id = persona_id;

    await axios.post(MESSENGER_GRAPHQL_ENDPOINT, body, { headers: MESSENGER_HEADERS }).catch((err) => {
      console.log(`Error: can't call messenger graphql with id: ${senderFbId} error:${err}`)
      return null;
    });

    return {
      body: body,
    };
  }

  static sendMedia = async function (senderFbId, type, url, persona_id) {
    console.log("type:", type, " |", type.split('/')[0])
    const attachmentType = type.split('/')[0] === "application" ? "file" : type.split('/')[0];

    const body = {
      "recipient": { id: senderFbId },
      "messaging_type": "response",
      "message": {
        attachment: {
          type: attachmentType,
          payload: { url: url }
        }
      }
    };
    if (persona_id)
      body.persona_id = persona_id;

    // Don't await or hitting a timeout
    axios.post(MESSENGER_GRAPHQL_ENDPOINT, body, { headers: MESSENGER_HEADERS }).catch((err) => {
      console.log(`Error: can't call messenger graphql with id: ${senderFbId} error:${err}`)
      return null;
    });

    return {
      body: body,
    };
  }

  static getFBProfile = async function (senderFbId) {
    console.log(`${FACEBOOK_IDENTITY_URL}${senderFbId}${FACEBOOK_IDENTITY_ENDPOINT}`);
    const response = await axios.get(`${FACEBOOK_IDENTITY_URL}${senderFbId}${FACEBOOK_IDENTITY_ENDPOINT}`, { headers: MESSENGER_HEADERS }).catch((err) => {
      console.log(`Error: can't call identity graphql with id: ${senderFbId}`)
      return null;
    });

    return response.data;
  }

  static getOrCreatePersona = async function (name, profileUrl) {

    const response = await axios.get(`${FACEBOOK_IDENTITY_URL}me/personas?access_token=${PAGE_ACCESS_TOKEN}`, { headers: MESSENGER_HEADERS }).catch((err) => {
      return null;
    });

    let persona_id;

    if (response !== null && response.data !== null && response.data.data !== null && response.data.data.length > 0) {
      for (let i = 0; i < response.data.data.length; i++) {
        const item = response.data.data[i];
        if (item.name === name) {
          persona_id = item.id;
          console.log("persona found:", item);
          return item;
        }
      }
    } else {
      if (name && profileUrl) {
        const body = {
          "name": name,
          "profile_picture_url": profileUrl
        };
        const response = await axios.post(`${FACEBOOK_IDENTITY_URL}me/personas?access_token=${PAGE_ACCESS_TOKEN}`, body, { headers: MESSENGER_HEADERS }).catch((err) => {
          return null;
        });
        if (response !== null && response.data !== null) {
          console.log("persona created:", response.data);
          return response.data;
        }
        else
          return null;
      }
    }
  }
}

module.exports = MessengerHelper;