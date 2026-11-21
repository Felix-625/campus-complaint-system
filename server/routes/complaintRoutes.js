const express = require('express');
const router = express.Router();
const {
  submitComplaint,
  trackComplaint,
  getPublicComplaints,
  getMyComplaints,
  toggleUpvote,
} = require('../controllers/complaintController');
const { authenticateUser, optionalAuth } = require('../middleware/auth');
const { complaintSubmitLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

// Public tracking and board routes
router.get('/track/:code', trackComplaint);
router.get('/public', optionalAuth, getPublicComplaints);

// Submit complaint (works for anonymous visitors or authenticated students)
router.post(
  '/',
  complaintSubmitLimiter,
  optionalAuth,
  upload.single('image'),
  submitComplaint
);

// Student private routes
router.get('/mine', authenticateUser, getMyComplaints);
router.post('/:id/upvote', authenticateUser, toggleUpvote);

module.exports = router;
