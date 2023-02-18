require('dotenv').config();
const axios = require("axios");
const process = require('process');
const FormData = require('form-data');

const NABLA_API_KEY = process.env.NABLA_API_KEY;
const NABLA_URL_PREFIX = "https://api.preprod.nabla.com";

const NABLA_ALLERGIES_API_ENDPOINT = `${NABLA_URL_PREFIX}/v1/server/allergy_intolerances`;
const NABLA_CONVERSATIONS_API_ENDPOINT = `${NABLA_URL_PREFIX}/v1/server/conversations`;
const NABLA_MEDICATIONS_API_ENDPOINT = `${NABLA_URL_PREFIX}/v1/server/medication_statements`;
const NABLA_MESSAGES_API_ENDPOINT = `${NABLA_URL_PREFIX}/v1/server/messages`;
const NABLA_ATTACHMENT_API_ENDPOINT = `${NABLA_URL_PREFIX}/v1/server/attachments`;
const NABLA_PATIENTS_API_ENDPOINT = `${NABLA_URL_PREFIX}/v1/server/patients`;
const NABLA_PROVIDERS_API_ENDPOINT = `${NABLA_URL_PREFIX}/v1/server/providers`;

const NABLA_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "X-Nabla-Api-Version": "2022-12-20",
  "Authorization": `Bearer ${NABLA_API_KEY}`
};

class NablaAPIHelper {
  static getProviderByEmail = async function (email) {
    const encodedEmail = encodeURIComponent(email);
    const getProviderByEmailUrl = `${NABLA_PROVIDERS_API_ENDPOINT}?email=${encodedEmail}`;
    const response = await axios.get(getProviderByEmailUrl, { headers: NABLA_HEADERS }).catch((err) => {
      console.log(`Error: can't get the Nabla provider with email: ${email}`);
      return null;
    });

    if (response.status === 200 && response.data !== null && response.data["data"] !== null && response.data["data"].length > 0) {
      const providers = response.data["data"];
      return providers[0];
    } else {
      return null;
    }
  };

  static getPatientByPhone = async function (phone) {
    const getPatientByPhoneUrl = `${NABLA_PATIENTS_API_ENDPOINT}?phone=${phone}`;
    const response = await axios.get(getPatientByPhoneUrl, { headers: NABLA_HEADERS }).catch((err) => {
      console.log(`Error: can't get the Nabla patient with phone: ${phone}`)
      return null;
    });

    if (response && response.status === 200 && response.data !== null && response.data["data"] !== null && response.data["data"].length > 0) {
      const patients = response.data["data"];
      return patients[0];
    } else {
      return null;
    }
  };

  static getPatientByUsername = async function (username) {
    const getPatientByUsernamelUrl = `${NABLA_PATIENTS_API_ENDPOINT}?username=${username}`;
    const response = await axios.get(getPatientByUsernamelUrl, { headers: NABLA_HEADERS }).catch((err) => {
      console.log(`Error: can't get the Nabla patient with username`, err)
      return null;
    });

    if (response && response.status === 200 && response.data !== null && response.data["data"] !== null && response.data["data"].length > 0) {
      const patients = response.data["data"];
      return patients[0];
    } else {
      return null;
    }
  };

  static getPatientByEmail = async function (email) {
    const getPatientByEmailUrl = `${NABLA_PATIENTS_API_ENDPOINT}?email=${email}`;
    const response = await axios.get(getPatientByEmailUrl, { headers: NABLA_HEADERS }).catch((err) => {
      console.log(`Error: can't get the Nabla patient with email`, err)
      return null;
    });

    if (response && response.status === 200 && response.data !== null && response.data["data"] !== null && response.data["data"].length > 0) {
      const patients = response.data["data"];
      return patients[0];
    } else {
      return null;
    }
  };

  static updatePatient = async function (id, firstName, lastName, username, locale, email, phone, dateOfBirth, sex) {
    const putPatientUrl = `${NABLA_PATIENTS_API_ENDPOINT}/${id}`;
    const body = {
      "first_name": firstName,
      "last_name": lastName,
      "username": username,
      "locale": locale,
      "email": email,
      "phone": phone,
      "date_of_birth": dateOfBirth,
      "sex": sex
    };

    await axios.put(putPatientUrl, body, { headers: NABLA_HEADERS }).catch((err) => {
      console.log(`Error: can't update the Nabla patient with id: ${id}`)
      return null;
    });
  };

  static createPatientFromWhatsApp = async function (username, phone) {
    const body = {
      "username": username,
      "phone": phone,
      "custom_fields": { "channel": "whatsapp" }
    };
    console.log(`${phone} - ${username}\n${NABLA_PATIENTS_API_ENDPOINT}\n${NABLA_HEADERS}`)

    const response = await axios.post(NABLA_PATIENTS_API_ENDPOINT, body, { headers: NABLA_HEADERS }).catch((err) => {
      console.log(`Error: can't create the Nabla patient with phone: ${phone} and username: ${username}`)
      return null;
    });

    return response.data;
  };

  static createPatientFromMessenger = async function (firstName, lastName, email, phone) {
    const body = {
      "first_name": firstName,
      "last_name": lastName,
      "custom_fields": { "channel": "messenger" }
    };
    if (email)
      body.email = email;
    if (phone)
      body.email = phone;

    const response = await axios.post(NABLA_PATIENTS_API_ENDPOINT, body, { headers: NABLA_HEADERS }).catch((err) => {
      console.log(`Error: can't create the Nabla patient with`, err)
      return null;
    });

    return response.data;
  };

  static getConversations = async function (patient) {
    const patientId = patient["id"];
    const getConversationsByPatientIdUrl = `${NABLA_CONVERSATIONS_API_ENDPOINT}?patient_id=${patientId}`;
    const response = await axios.get(getConversationsByPatientIdUrl, { headers: NABLA_HEADERS }).catch((err) => {
      console.log(`Error: can't get conversations from nabla for patientId: ${patientId}`);
      return null;
    });

    if (response !== null && response.data !== null && response.data["data"] !== null && response.data["data"].length > 0) {
      return response.data["data"];
    } else {
      return [];
    }
  };

  static getConversation = async function (conversation_id) {
    const response = await axios.get(`${NABLA_CONVERSATIONS_API_ENDPOINT}/${conversation_id}`, { headers: NABLA_HEADERS }).catch((err) => {
      console.log(`Error: can't get conversation for conversation_id: ${conversation_id}`);
      return null;
    });
    if (response !== null && response.data !== null) {
      const data = response.data;
      return data;
    } else {
      return [];
    }
  }

  static createConversation = async function (patient, title, providers, assignedProvider) {
    const patientId = patient["id"];
    const body = {
      "patient_ids": [patientId],
      "type": "individual_conversation"
    };

    if (title) {
      body["title"] = title;
    }

    if (providers) {
      body["provider_ids"] = providers.map(provider => provider["id"]);
    }

    if (assignedProvider) {
      body["assigned_provider_id"] = assignedProvider["id"];
    }

    const response = await axios.post(NABLA_CONVERSATIONS_API_ENDPOINT, body, { headers: NABLA_HEADERS }).catch((err) => {
      console.log(`Error: can't create a new conversation ${err}`);
      return null;
    });;
    return response.data;
  };

  static getOrCreateConversation = async function (patient) {
    const conversations = await NablaAPIHelper.getConversations(patient);

    let conversation;
    if (conversations.length > 0) {
      conversation = conversations[0];
    } else {
      conversation = await NablaAPIHelper.createConversation(patient, null, null, null);
    }

    return conversation;
  }

  static sendSystemMessage = async function (conversation, text) {
    const conversationId = conversation["id"];
    const body = {
      "conversation_id": conversationId,
      "author": { type: "system" },
      "content": {
        "type": "text",
        "text": text,
      }
    };

    await axios.post(NABLA_MESSAGES_API_ENDPOINT, body, { headers: NABLA_HEADERS });
  };

  static sendMessage = async function (patient, conversation, text) {
    const conversationId = conversation["id"];
    const patientId = patient["id"];
    const body = {
      "conversation_id": conversationId,
      "author": { type: "patient", id: patientId },
      "content": {
        "type": "text",
        "text": text,
      }
    };

    const response = await axios.post(NABLA_MESSAGES_API_ENDPOINT, body, { headers: NABLA_HEADERS });
    return response.data;
  };

  static sendMedia = async function (patient, conversation, url) {
    const conversationId = conversation["id"];
    const patientId = patient["id"];

    // Fetch media as a stream
    const media = await axios.get(url, { responseType: 'stream' });

    const form = new FormData();
    // // Pass media stream from response directly to form
    form.append('file', media.data, 'media');
    form.append('author', JSON.stringify({ type: "patient", id: patientId }));

    // When using axios in Node.js, you need to set the Content-Type header with the form boundary
    // by using the form's `getHeaders()` method
    const attachment = await axios.post(NABLA_ATTACHMENT_API_ENDPOINT, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${NABLA_API_KEY}`
      },
    }).catch((err) => {
      console.log("Post attachment error:", err)
    });

    // Send the message with the attachment
    const body = {
      "conversation_id": conversationId,
      "author": { type: "patient", id: patientId },
      "content": {
        type: "attachment",
        file_upload_id: attachment.data.id
      }
    };

    const response = await axios.post(NABLA_MESSAGES_API_ENDPOINT, body, { headers: NABLA_HEADERS });
    return response.data;
  };

  static addAllergy = async function (patient, allergySummary) {
    const patientId = patient["id"];
    const body = {
      "patient_id": patientId,
      "summary": allergySummary
    };

    await axios.post(NABLA_ALLERGIES_API_ENDPOINT, body, { headers: NABLA_HEADERS });
  };

  static addMedication = async function (patient, medicationSummary) {
    const patientId = patient["id"];
    const body = {
      "patient_id": patientId,
      "summary": medicationSummary
    };

    await axios.post(NABLA_MEDICATIONS_API_ENDPOINT, body, { headers: NABLA_HEADERS });
  };
}

module.exports = NablaAPIHelper;
