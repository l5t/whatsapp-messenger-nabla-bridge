const MessengerHelper = require("./helpers/messenger-helper");
const NablaAPIHelper = require("./helpers/nabla-api-helper");

exports.handler = async (event, context) => {

  const verifyStatus = await MessengerHelper.verifyRequest(event);
  if (verifyStatus)
    return verifyStatus

  if (event && event.body) {
    const payload = JSON.parse(event.body);

    if (payload && payload.object === "page") {
      var messagingEvents = payload.entry[0].messaging;
      for (var i = 0; i < messagingEvents.length; i++) {
        var messagingEvent = messagingEvents[i];

        var sender = messagingEvent.sender.id;
        if (messagingEvent.message) {
          if (messagingEvent.message.text) {
            var text = messagingEvent.message.text;
            console.log("Receive a message: ", text, " from:", sender);

            await handleNewMessage(sender, text)
          }
          if (messagingEvent.message.attachments) {
            for (var i = 0; i < messagingEvent.message.attachments.length; i++) {
              var attachment = messagingEvent.message.attachments[i];
              if (attachment.type && attachment.payload) {
                console.log("Receive a ", attachment.type, " :", attachment.payload.url, " from:", sender);
                handleNewMedia(sender, attachment.payload.url);
              }
            }
          }

          return {
            statusCode: 200,
            body: "Message sent"
          };
        }
      }

      return {
        statusCode: 200,
        body: "EVENT_RECEIVED"
      };
    }
    else {
      return {
        statusCode: 404,
      };
    }
  }
};

const getOrCreatePatient = async function (sender) {
  // Hack using the nabla username to store the fbid
  let patient = await NablaAPIHelper.getPatientByUsername(sender);
  if (!patient) {
    const profile = await MessengerHelper.getFBProfile(sender);
    patient = await NablaAPIHelper.createPatientFromMessenger(profile.first_name, profile.last_name, null, sender);
  }

  return patient;
};

const handleNewMessage = async (sender, text) => {

  // Find or create patient
  const patient = await getOrCreatePatient(sender);

  // Find or create conversation
  const conversation = await NablaAPIHelper.getOrCreateConversation(patient);

  // Send new message to Nabla
  await NablaAPIHelper.sendMessage(patient, conversation, text);
}

const handleNewMedia = async (sender, url) => {

  // Find or create patient
  const patient = await getOrCreatePatient(sender);

  // Find or create conversation
  const conversation = await NablaAPIHelper.getOrCreateConversation(patient);

  // Send media to Nabla not await to avoid timeout
  NablaAPIHelper.sendMedia(patient, conversation, url);
}
