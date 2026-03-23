const express = require("express");
const { postMessage } = require("../controllers/chatController");

const router = express.Router();

router.post("/message", postMessage);

module.exports = router;
