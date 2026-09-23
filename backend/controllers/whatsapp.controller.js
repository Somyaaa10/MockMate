const User = require("../models/user.model");

const { sendWhatsAppMessage } = require("../services/whatsapp.service");

const {
  generateLinkCode,
  consumeLinkCode,
} = require("../services/whatsappLink.service");

// VERIFY WEBHOOK
const verifyWebhook = (req, res) => {
  console.log("========== WHATSAPP WEBHOOK VERIFY ==========");

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Mode:", mode);
  console.log("Verify token received:", token ? "YES" : "NO");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("WhatsApp webhook verified");

    return res.status(200).send(challenge);
  }

  console.log("WhatsApp webhook verification failed");

  return res.sendStatus(403);
};

// RECEIVE WEBHOOK
const receiveWebhook = async (req, res) => {
  console.log("========== WHATSAPP WEBHOOK ==========");

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value) {
      console.log("⚠️ No webhook value found");
      return res.sendStatus(200);
    }

    // ========================================
    // INCOMING MESSAGES
    // ========================================

    if (value.messages) {
      for (const message of value.messages) {
        const sender = message.from;
        const messageId = message.id;
        const messageType = message.type;

        let text = "";
        let linkCodeDetected = "NO";
        let linkSuccessful = "NO";
        let replySent = "NO";

        if (messageType === "text") {
          text = message.text?.body?.trim() || "";
        }

        if (messageType !== "text") {
          console.log(`Sender: ${sender}`);
          console.log(`Message: N/A`);
          console.log(`Type: ${messageType}`);
          console.log(`Link code detected: NO`);
          console.log(`Link successful: NO`);
          console.log(`Reply sent: NO`);
          continue;
        }

        // ====================================
        // WHATSAPP ACCOUNT LINKING
        // ====================================

        if (/^MM-\d{6}$/i.test(text)) {
          const upperCode = text.toUpperCase();
          linkCodeDetected = `YES (${upperCode})`;

          try {
            const linkData = await consumeLinkCode(upperCode);

            if (!linkData) {
              linkSuccessful = "NO (Invalid or expired code)";
              try {
                await sendWhatsAppMessage(
                  sender,
                  "❌ This linking code is invalid or expired.\n\nPlease generate a new code from MockMate.",
                );
                replySent = "YES";
              } catch (msgErr) {
                console.error(
                  "❌ Failed to send invalid code message:",
                  msgErr.message,
                );
                replySent = "NO (Send error)";
              }
            } else {
              const user = await User.findById(linkData.userId);

              if (!user) {
                linkSuccessful = "NO (User not found)";
                try {
                  await sendWhatsAppMessage(
                    sender,
                    "❌ MockMate account not found.\n\nPlease generate a new linking code.",
                  );
                  replySent = "YES";
                } catch (msgErr) {
                  console.error(
                    "❌ Failed to send user not found message:",
                    msgErr.message,
                  );
                  replySent = "NO (Send error)";
                }
              } else {
                // Prevent WhatsApp number from being linked to another user
                const existingUser = await User.findOne({
                  whatsappPhone: sender,
                  _id: { $ne: user._id },
                });

                if (existingUser) {
                  linkSuccessful =
                    "NO (WhatsApp number already linked to another user)";
                  try {
                    await sendWhatsAppMessage(
                      sender,
                      "❌ This WhatsApp number is already linked to another MockMate account.",
                    );
                    replySent = "YES";
                  } catch (msgErr) {
                    console.error(
                      "❌ Failed to send already linked message:",
                      msgErr.message,
                    );
                    replySent = "NO (Send error)";
                  }
                } else {
                  // Link WhatsApp number
                  user.whatsappPhone = sender;
                  await user.save();

                  linkSuccessful = "YES";
                  try {
                    await sendWhatsAppMessage(
                      sender,
                      `✅ WhatsApp successfully connected to your MockMate account, ${user.fullName}!`,
                    );
                    replySent = "YES";
                  } catch (msgErr) {
                    console.error(
                      "❌ Failed to send success message:",
                      msgErr.message,
                    );
                    replySent = "NO (Send error)";
                  }
                }
              }
            }
          } catch (codeErr) {
            console.error("❌ Link code processing error:", codeErr.message);
            linkSuccessful = `NO (Error: ${codeErr.message})`;
          }
        } else {
          // ====================================
          // NORMAL MESSAGE
          // ====================================

          try {
            await sendWhatsAppMessage(
              sender,
              `Hello! 👋 You said: "${text}"\n\nWelcome to MockMate!`,
            );
            replySent = "YES";
          } catch (msgErr) {
            console.error("❌ Failed to send normal reply:", msgErr.message);
            replySent = "NO (Send error)";
          }
        }

        console.log(`Sender: ${sender}`);
        console.log(`Message: ${text}`);
        console.log(`Type: ${messageType}`);
        console.log(`Link code detected: ${linkCodeDetected}`);
        console.log(`Link successful: ${linkSuccessful}`);
        console.log(`Reply sent: ${replySent}`);
      }
    }

    // ========================================
    // MESSAGE STATUS
    // ========================================

    if (value.statuses) {
      for (const status of value.statuses) {
        console.log("📨 WhatsApp status");
        console.log("Message ID:", status.id);
        console.log("Status:", status.status);
        console.log("Recipient:", status.recipient_id);
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("❌ WhatsApp webhook error:", error.message);
    return res.sendStatus(200);
  }
};

// GENERATE WHATSAPP LINK CODE
const generateWhatsAppLink = async (req, res) => {
  try {
    const code = await generateLinkCode(req.user._id);

    return res.status(200).json({
      success: true,
      message: "WhatsApp linking code generated",
      code,
      expiresIn: 600,
    });
  } catch (error) {
    console.error("WhatsApp link generation error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// EXPORT
module.exports = {
  verifyWebhook,
  receiveWebhook,
  generateWhatsAppLink,
};
