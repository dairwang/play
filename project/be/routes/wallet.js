const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/auth');

// GET /api/wallet/flow/list
router.get('/flow/list', authMiddleware, walletController.getWalletFlowList);

module.exports = router;

