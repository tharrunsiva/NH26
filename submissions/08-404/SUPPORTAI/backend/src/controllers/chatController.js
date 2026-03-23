const Ticket = require("../models/Ticket");
const { processSupportMessage } = require("../services/aiService");
const { createTicketId } = require("../utils/ticket");
const { getIo } = require("../services/socketService");

async function postMessage(req, res) {
  try {
    const { message, transcript = [], userId, orderContext = {}, learningMode = false } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const analysis = await processSupportMessage({
      message,
      transcript,
      orderContext,
      learningMode
    });

    let ticket = null;

    if (!analysis.resolved) {
      ticket = await Ticket.create({
        ticketId: createTicketId(),
        userId: userId || null,
        orderId: orderContext.orderId || null,
        issueSummary: message,
        messages: [
          ...transcript,
          { sender: "user", text: message, language: analysis.language },
          { sender: "bot", text: analysis.response, language: analysis.language }
        ],
        category: analysis.category,
        severity: analysis.severity,
        language: analysis.language
      });

      const io = getIo();
      if (io) io.emit("ticket:created", ticket);
    }

    return res.json({ ...analysis, ticket });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Chat processing failed" });
  }
}

module.exports = { postMessage };
