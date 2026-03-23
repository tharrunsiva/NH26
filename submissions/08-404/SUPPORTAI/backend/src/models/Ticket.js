const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "bot", "agent"], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    language: { type: String, default: "English" }
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderId: String,
    issueSummary: String,
    messages: [messageSchema],
    category: {
      type: String,
      enum: ["Billing", "Technical", "Delivery"],
      required: true
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
      default: "OPEN"
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    language: { type: String, default: "English" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
