const CollaborationRequest = require('../models/CollaborationRequest');
const User = require('../models/User');

// Get all collaboration requests for the authenticated user
const getRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await CollaborationRequest.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
    .populate('senderId', 'name email role investorProfile')
    .populate('receiverId', 'name email role entrepreneurProfile')
    .sort('-createdAt');

    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send a new collaboration request
const sendRequest = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    // Validate that sender and receiver exist and have appropriate roles
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if sender is investor and receiver is entrepreneur or vice versa
    const isValidRequest = (sender.role === 'investor' && receiver.role === 'entrepreneur') ||
                         (sender.role === 'entrepreneur' && receiver.role === 'investor');

    if (!isValidRequest) {
      return res.status(400).json({ message: 'Invalid collaboration request. Must be between investor and entrepreneur.' });
    }

    // Check if request already exists
    const existingRequest = await CollaborationRequest.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A request already exists between these users' });
    }

    const request = new CollaborationRequest({
      senderId,
      receiverId,
      message,
      status: 'pending'
    });

    await request.save();

    // Populate sender and receiver details
    const populatedRequest = await request.populate([
      { path: 'senderId', select: 'name email role investorProfile' },
      { path: 'receiverId', select: 'name email role entrepreneurProfile' }
    ]);

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('Error sending request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update request status
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await CollaborationRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Ensure the current user is the receiver of the request
    if (request.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    // Don't allow updating if request is already processed
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    request.status = status;
    await request.save();

    if (status === 'accepted') {
      // Add users to each other's connections
      await Promise.all([
        User.findByIdAndUpdate(request.senderId, {
          $addToSet: { connections: request.receiverId }
        }),
        User.findByIdAndUpdate(request.receiverId, {
          $addToSet: { connections: request.senderId }
        })
      ]);
    }

    const populatedRequest = await request.populate([
      { path: 'senderId', select: 'name email role investorProfile' },
      { path: 'receiverId', select: 'name email role entrepreneurProfile' }
    ]);

    res.json(populatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get count of pending requests
const getPendingRequestsCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await CollaborationRequest.countDocuments({
      receiverId: userId,
      status: 'pending'
    });

    res.json({ count });
  } catch (error) {
    console.error('Error getting pending count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all connections for the authenticated user
const getConnections = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('connections', 'name email role investorProfile entrepreneurProfile');
    res.json(user.connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getRequests,
  sendRequest,
  updateRequestStatus,
  getPendingRequestsCount,
  getConnections
}; 