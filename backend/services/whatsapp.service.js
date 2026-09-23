const axios = require("axios");

const sendWhatsAppMessage = async (to, message) => {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId) {
      throw new Error("WHATSAPP_PHONE_NUMBER_ID is missing");
    }

    if (!accessToken) {
      throw new Error("WHATSAPP_ACCESS_TOKEN is missing");
    }

    const url = `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ WhatsApp message sent");
    console.log("Message ID:", response.data?.messages?.[0]?.id);

    return response.data;
  } catch (error) {
    console.error("❌ WhatsApp send error:");
    console.error(error.response?.data || error.message);

    throw error;
  }
};

module.exports = {
  sendWhatsAppMessage,
};
