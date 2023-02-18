require('dotenv').config();
const crypto = require('crypto');
const TwilioHelper = require("./helpers/twilio-helper");
const NablaAPIHelper = require("./helpers/nabla-api-helper");
const MessengerHelper = require("./helpers/messenger-helper");

const {
  NABLA_API_SECRET_KEY
} = process.env;

exports.handler = async function (event, context) {

  const timestamp = event.headers["x-nabla-webhook-timestamp"];
  const receivedSignature = event.headers["x-nabla-webhook-signature"];

  const computedSignature = crypto.createHmac("sha256", NABLA_API_SECRET_KEY)
    .update(timestamp + event.body)
    .digest("hex");

  if (receivedSignature !== computedSignature)
    return {
      statusCode: 400,
      body: 'Unable to verify the signature',
    };

  try {
    const body = JSON.parse(event.body);
    console.log("body.type", body.type)
    switch (body.type) {
      case "conversation.message.created":
        //only send messages from provider to avoid the echo of the patient messafge
        if (body.data && body.data.author && body.data.author.type !== "patient") {
          await sendMessage(body.data);
          return {
            statusCode: 200,
            body: "Message sent"
          };
        }
        else
          return {
            statusCode: 200,
            body: 'No action needed because message from patient',
          };
      case "appointment.created":
      default:
        return {
          statusCode: 200,
          body: 'Event not supported yet',
        };
    }
  } catch (e) {
    return {
      statusCode: 400,
      body: e,
    };
  }

};

const sendMessage = async function (data) {

  // find the channel to answer
  // should be stored in a db to avoid calling this api every time
  const conversation = await NablaAPIHelper.getConversation(data.conversation_id);

  const displayDoctorName = data.author.type === "provider" ? `${data.author.prefix}${data.author.prefix ? " " : ""}${data.author.first_name} ${data.author.last_name}` : "";

  switch (conversation.patients[0].custom_fields.channel) {
    case "whatsapp":
      if (data.attachment) {
        await TwilioHelper.sendMedia(`whatsapp:+${conversation.patients[0].phone}`, data.attachment.ephemeral_url.url);
      } else {
        await TwilioHelper.sendMessage(`whatsapp:+${conversation.patients[0].phone}`, displayDoctorName ? `*${displayDoctorName}*\r\n${data.text}` : data.text);
      }
      break;
    case "messenger":
      // use Persona if your page is not in Japan or EU https://developers.facebook.com/docs/messenger-platform/europe-japan-updates
      const persona = data.author.type === "provider" && data.author.ephemeral_avatar_url ? await MessengerHelper.getOrCreatePersona(displayDoctorName, data.author.ephemeral_avatar_url.url) : null;

      if (data.attachment) {
        // Send media to messenger
        // await MessengerHelper.sendMedia(conversation.patients[0].phone, data.attachment.mime_type, data.attachment.ephemeral_url.url, persona ? persona.id : null)
        await MessengerHelper.sendMedia(conversation.patients[0].custom_fields.fbid, data.attachment.mime_type, data.attachment.ephemeral_url.url, persona ? persona.id : null)

      }
      else {
        // Send new message to messenger
        console.log("send message on messenger:", `${data.text}`, " by:", displayDoctorName);
        if (persona && persona.id)
          // await MessengerHelper.sendTextMessage(conversation.patients[0].phone, data.text, persona.id);
          await MessengerHelper.sendTextMessage(conversation.patients[0].custom_fields.fbid, data.text, persona.id);
        else
          // await MessengerHelper.sendTextMessage(conversation.patients[0].phone, displayDoctorName ? `${displayDoctorName}\r\n\n${data.text}` : data.text, null);
          await MessengerHelper.sendTextMessage(conversation.patients[0].custom_fields.fbid, displayDoctorName ? `${displayDoctorName}\r\n\n${data.text}` : data.text, null);
      }
      break;
    default:
      break;
  }
};