const express = require('express');
const router = express.Router();
const {
  getAdminComplaints,
  updateComplaintStatus,
  getAdminStats,
} = require('../controllers/adminController');
const { authenticateUser, adminOnly } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateUser);
router.use(adminOnly);

router.get('/complaints', getAdminComplaints);
router.patch('/complaints/:id/status', updateComplaintStatus);
router.get('/stats', getAdminStats);

module.exports = router;
