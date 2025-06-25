const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

const controller = {
  // Get unread messages count
  getUnreadCount: async (req, res) => {
    try {
      const currentUserId = req.user._id;
      const count = await ChatMessage.countDocuments({
        receiverId: currentUserId,
        read: false
      });
      res.json({ unreadCount: count });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching unread count', error: error.message });
    }
  },

  // Get recent conversations
  getRecentConversations: async (req, res) => {
    try {
      const currentUserId = req.user._id;
      const messages = await ChatMessage.find({
        $or: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      })
      .sort({ timestamp: -1 });

      const userIds = new Set();
      messages.forEach(msg => {
        if (msg.senderId.toString() !== currentUserId.toString()) {
          userIds.add(msg.senderId);
        }
        if (msg.receiverId.toString() !== currentUserId.toString()) {
          userIds.add(msg.receiverId);
        }
      });

      const conversations = await User.find({
        _id: { $in: Array.from(userIds) }
      })
      .select('name profilePicture');

      const formattedConversations = conversations.map(user => {
        const lastMessage = messages.find(msg => 
          msg.senderId.toString() === user._id.toString() || 
          msg.receiverId.toString() === user._id.toString()
        );

        return {
          user: {
            _id: user._id,
            name: user.name,
            profilePicture: user.profilePicture
          },
          lastMessage: {
            message: lastMessage.message,
            timestamp: lastMessage.timestamp,
            unread: !lastMessage.read && lastMessage.receiverId.toString() === currentUserId.toString()
          }
        };
      });

      res.json(formattedConversations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching conversations', error: error.message });
    }
  },

  // Get chat messages between users
  getChatMessages: async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user._id;

      const messages = await ChatMessage.find({
        $or: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId }
        ]
      })
      .sort({ timestamp: 1 })
      .populate('senderId', 'name profilePicture')
      .populate('receiverId', 'name profilePicture');

      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
  },

  // Send a new message
  sendMessage: async (req, res) => {
    try {
      const { receiverId, message } = req.body;
      const senderId = req.user._id;

      const newMessage = new ChatMessage({
        senderId,
        receiverId,
        message,
        timestamp: new Date(),
        read: false
      });

      await newMessage.save();
      
      await newMessage.populate('senderId', 'name profilePicture');
      await newMessage.populate('receiverId', 'name profilePicture');

      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ message: 'Error sending message', error: error.message });
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user._id;

      await ChatMessage.updateMany(
        {
          senderId: userId,
          receiverId: currentUserId,
          read: false
        },
        {
          $set: { read: true }
        }
      );

      res.json({ message: 'Messages marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Error marking messages as read', error: error.message });
    }
  }
};

module.exports = controller; 