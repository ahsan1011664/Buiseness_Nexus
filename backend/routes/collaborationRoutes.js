const express = require('express');
const router = express.Router();
const  auth  = require('../middleware/auth');
const {
  getRequests,
  getPendingRequestsCount,
  sendRequest,
  updateRequestStatus,
  getConnections
} = require('../controllers/collaborationController');

// Get all collaboration requests for the authenticated user
router.get('/requests', auth, getRequests);

// Get count of pending requests
router.get('/requests/pending/count', auth, getPendingRequestsCount);

// Send a new collaboration request
router.post('/request', auth, sendRequest);

// Update request status (accept/reject)
router.patch('/request/:requestId', auth, updateRequestStatus);

// Get all connections for the authenticated user
router.get('/', auth, getConnections);

module.exports = router; 