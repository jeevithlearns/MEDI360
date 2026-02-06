/**
 * Chat Routes
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Session management
router.post('/session', chatController.createSession);
router.get('/sessions', chatController.getUserSessions);
router.get('/session/:sessionId', chatController.getSession);
router.put('/session/:sessionId/complete', chatController.completeSession);
router.delete('/session/:sessionId', chatController.deleteSession);

// Messaging
router.post('/session/:sessionId/message', chatController.sendMessage);

module.exports = router;
