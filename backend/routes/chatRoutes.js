const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Get unread messages count
router.get('/unread/count', auth, (req, res) => {
  return chatController.getUnreadCount(req, res);
});

// Get recent conversations
router.get('/conversations/recent', auth, (req, res) => {
  return chatController.getRecentConversations(req, res);
});

// Get chat messages between users
router.get('/:userId', auth, (req, res) => {
  return chatController.getChatMessages(req, res);
});

// Send a new message
router.post('/message', auth, (req, res) => {
  return chatController.sendMessage(req, res);
});

// Mark messages as read
router.put('/:userId/read', auth, (req, res) => {
  return chatController.markMessagesAsRead(req, res);
});

module.exports = router; 