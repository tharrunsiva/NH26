const express = require("express");
const {
  createTicket,
  getTickets,
  assignTicket,
  resolveTicket
} = require("../controllers/ticketController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/create", createTicket);
router.get("/", protect, authorize("agent", "admin"), getTickets);
router.patch("/:ticketId/assign", protect, authorize("agent", "admin"), assignTicket);
router.patch("/:ticketId/resolve", protect, authorize("agent", "admin"), resolveTicket);

module.exports = router;
