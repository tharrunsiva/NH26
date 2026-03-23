function createTicketId() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TKT-${Date.now().toString().slice(-6)}-${random}`;
}

module.exports = { createTicketId };
