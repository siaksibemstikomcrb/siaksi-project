const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/authController');

// Login Route
router.post('/login', login);

// Logout Route (Wajib ada untuk hapus cookie)
router.post('/logout', logout);

module.exports = router;