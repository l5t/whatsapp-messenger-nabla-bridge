const NablaAPIHelper = require("./helpers/nabla-api-helper");

exports.handler = async (event, context) => {

  const payload = new URLSearchParams(event.body);

  console.log("payload=", payload);

  if (payload.get("Body"))
    await handleNewMessage(payload);
  if (payload.get("NumMedia") > 0)
    await handleNewMedia(payload);

  return {
    statusCode: 200,
  };
};

const getOrCreatePatient = async function (payload) {
  const phone = payload.get("From").slice(10);
  const username = payload.get("ProfileName").replace(" ", "").toLowerCase();

  let patient = await NablaAPIHelper.getPatientByPhone(phone);
  if (!patient) {
    patient = await NablaAPIHelper.createPatientFromWhatsApp(username, phone);
  }

  return patient;
};

const handleNewMessage = async (payload) => {

  // Find or create patient
  const patient = await getOrCreatePatient(payload);

  // Find or create conversation
  const conversation = await NablaAPIHelper.getOrCreateConversation(patient);

  // Send new message on conversation
  await NablaAPIHelper.sendMessage(patient, conversation, payload.get("Body"));
}

const handleNewMedia = async (payload) => {

  // Find or create patient
  const patient = await getOrCreatePatient(payload);

  // Find or create conversation
  const conversation = await NablaAPIHelper.getOrCreateConversation(patient);

  // Send media to Nabla not await to avoid timeout
  //only supported file https://support.twilio.com/hc/en-us/articles/360017961894-Sending-and-Receiving-Media-with-WhatsApp-Messaging-on-Twilio#h_01F63FCC54J22ZZFBERMF8058N
  // TODO: issue with big file like picture from mobile phone
  NablaAPIHelper.sendMedia(patient, conversation, payload.get("MediaUrl0"));
}