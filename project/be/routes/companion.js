const express = require('express');
const router = express.Router();
const companionController = require('../controllers/companionController');
const authMiddleware = require('../middleware/auth');

// Public
router.get('/list', companionController.getServices);
router.get('/detail', companionController.getDetail);

// User
router.post('/apply', authMiddleware, companionController.applyService);
router.get('/my', authMiddleware, companionController.getMyServices);
router.post('/toggle/:id', authMiddleware, companionController.toggleStatus);
router.put('/update/:id', authMiddleware, companionController.updateMyService);

// Admin
router.get('/audit/list', authMiddleware, companionController.getAuditList);
router.post('/audit/:id', authMiddleware, companionController.auditService);

module.exports = router;
