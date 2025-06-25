// controllers/connectionsController.js


const User = require('../models/User');
// Get user's connections
exports.getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('connections', 'name email role profilePicture bio investorProfile entrepreneurProfile');
    
    res.json(user.connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Error fetching connections', error: error.message });
  }
};

// Get pending connection requests
exports.getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'pendingRequests.from',
        select: 'name email role profilePicture bio investorProfile entrepreneurProfile'
      });
    
    const pendingRequests = user.pendingRequests.filter(request => request.status === 'pending');
    res.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Error fetching pending requests', error: error.message });
  }
};

// Get count of pending requests
exports.getPendingRequestsCount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const count = user.pendingRequests.filter(request => request.status === 'pending').length;
    res.json({ count });
  } catch (error) {
    console.error('Error fetching pending requests count:', error);
    res.status(500).json({ message: 'Error fetching pending requests count', error: error.message });
  }
};

// Send a connection request
exports.sendConnectionRequest = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Check if request already exists
    const existingRequest = receiver.pendingRequests.find(
      request => request.from.toString() === req.user._id.toString() && request.status === 'pending'
    );
    if (existingRequest) {
      return res.status(400).json({ message: 'Connection request already sent' });
    }

    // Check if already connected
    if (receiver.connections.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already connected' });
    }

    // Add request to receiver's pending requests
    receiver.pendingRequests.push({
      from: req.user._id,
      message
    });
    await receiver.save();

    res.json({ message: 'Connection request sent successfully' });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ message: 'Error sending connection request', error: error.message });
  }
};

// Handle (accept/reject) a connection request
exports.handleConnectionRequest = async (req, res) => {
  try {
    const { requestId, action } = req.params;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const user = await User.findById(req.user._id);
    const requestIndex = user.pendingRequests.findIndex(
      request => request._id.toString() === requestId && request.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Request not found or already handled' });
    }

    const request = user.pendingRequests[requestIndex];

    if (action === 'accept') {
      // Add connection for both users
      user.connections.addToSet(request.from);
      const sender = await User.findById(request.from);
      sender.connections.addToSet(user._id);
      await sender.save();
    }

    // Update request status
    user.pendingRequests[requestIndex].status = action === 'accept' ? 'accepted' : 'rejected';
    await user.save();

    res.json({ message: `Connection request ${action}ed successfully` });
  } catch (error) {
    console.error('Error handling connection request:', error);
    res.status(500).json({ message: 'Error handling connection request', error: error.message });
  }
};

// Remove connection
exports.removeConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user._id;

    // Remove connection from both users
    await User.findByIdAndUpdate(userId, {
      $pull: { connections: connectionId }
    });
    await User.findByIdAndUpdate(connectionId, {
      $pull: { connections: userId }
    });

    res.json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ message: 'Error removing connection', error: error.message });
  }
};
