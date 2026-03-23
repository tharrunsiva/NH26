const Ticket = require("../models/Ticket");
const { getIo } = require("../services/socketService");

async function createTicket(req, res) {
  try {
    const ticket = await Ticket.create(req.body);
    return res.status(201).json(ticket);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function getTickets(req, res) {
  try {
    const { severity, category, status } = req.query;
    const query = {};

    if (severity) query.severity = severity;
    if (category) query.category = category;
    if (status) query.status = status;

    const tickets = await Ticket.find(query)
      .populate("userId", "name email")
      .populate("assignedAgent", "name email")
      .sort({ createdAt: -1 });

    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tickets" });
  }
}

async function assignTicket(req, res) {
  try {
    const { ticketId } = req.params;
    const { assignedAgent } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { assignedAgent, status: "IN_PROGRESS" },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("assignedAgent", "name email");

    const io = getIo();
    if (io) io.emit("ticket:updated", ticket);

    return res.json(ticket);
  } catch (error) {
    return res.status(400).json({ message: "Ticket assignment failed" });
  }
}

async function resolveTicket(req, res) {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status: "RESOLVED" },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("assignedAgent", "name email");

    const io = getIo();
    if (io) io.emit("ticket:updated", ticket);

    return res.json(ticket);
  } catch (error) {
    return res.status(400).json({ message: "Ticket resolution failed" });
  }
}

module.exports = { createTicket, getTickets, assignTicket, resolveTicket };
