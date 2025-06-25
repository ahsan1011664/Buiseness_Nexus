const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getConnections, 
  getPendingRequests,
  getPendingRequestsCount,
  sendConnectionRequest,
  handleConnectionRequest,
  removeConnection
} = require('../controllers/connectionsController');

// Get user's connections
router.get('/', auth, getConnections);

// Get pending connection requests
router.get('/requests/pending', auth, getPendingRequests);

// Get count of pending requests
router.get('/requests/pending/count', auth, getPendingRequestsCount);

// Send a connection request
router.post('/request', auth, sendConnectionRequest);

// Handle (accept/reject) a connection request
router.post('/request/:requestId/:action', auth, handleConnectionRequest);

// Remove connection
router.delete('/:connectionId', auth, removeConnection);

module.exports = router; 