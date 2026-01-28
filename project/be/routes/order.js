const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

router.post('/create', authMiddleware, orderController.createOrder);
router.get('/my', authMiddleware, orderController.getMyOrders);
router.post('/accept/:id', authMiddleware, orderController.acceptOrder);
router.post('/complete/:id', authMiddleware, orderController.completeOrder);
router.post('/cancel/:id', authMiddleware, orderController.cancelOrder);

// Admin
router.get('/all', authMiddleware, orderController.getAllOrders);

module.exports = router;
