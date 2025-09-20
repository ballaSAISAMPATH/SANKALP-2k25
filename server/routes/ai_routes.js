const express = require('express');
const router = express.Router();
const {initial} = require("../controllers/ai_initialController");
router.post('/generate',initial);

module.exports = router;