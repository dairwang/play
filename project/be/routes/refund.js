const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refundController');
const authMiddleware = require('../middleware/auth');

// User
router.post('/apply', authMiddleware, refundController.applyRefund);
router.get('/my', authMiddleware, refundController.getMyRefunds);

// Admin
router.get('/all', authMiddleware, refundController.getAllRefunds);
router.post('/:id/approve', authMiddleware, refundController.approveRefund);
router.post('/:id/reject', authMiddleware, refundController.rejectRefund);

module.exports = router;

